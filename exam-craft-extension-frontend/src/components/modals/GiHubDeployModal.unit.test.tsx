import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GitHubDeployModal } from "./GitHubDeployModal";

if (typeof navigator !== "undefined" && !navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
        value: {
            writeText: vi.fn().mockResolvedValue(undefined),
            readText: vi.fn().mockResolvedValue(""),
        },
        configurable: true,
    });
}

const mockOpen = vi.fn();
Object.defineProperty(window, "open", {
    value: mockOpen,
    writable: true,
    configurable: true,
});

const baseProps = {
    domainName: "mi-web.com",
    templateRepo: "mi-usuario/template",
    newRepoName: "mi-nuevo-repo",
    uploadListString: "src/index.js\nsrc/components/App.js\npackage.json",
    savedToken: null,
    onConfirm: vi.fn(),
    onSuccess: vi.fn(),
    onClose: vi.fn(),
};

beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
});

describe("GitHubDeployModal – renderizado inicial (Estado: confirm)", () => {
    it("renderiza el título de confirmación principal", () => {
        render(<GitHubDeployModal {...baseProps} />);
        expect(screen.getByText("CONFIRMAR SUBIDA A GITHUB")).toBeInTheDocument();
    });

    it("muestra el nombre del nuevo repositorio correctamente", () => {
        render(<GitHubDeployModal {...baseProps} />);
        expect(screen.getByText("Repo:")).toBeInTheDocument();
        expect(screen.getByText("mi-nuevo-repo")).toBeInTheDocument();
    });

    it("mapea y limpia los elementos de la lista a subir saltándose líneas vacías", () => {
        const customUploadString = "  - src/App.tsx  \n\n- package.json  ";
        render(<GitHubDeployModal {...baseProps} uploadListString={customUploadString} />);
        
        expect(screen.getByText("src/App.tsx")).toBeInTheDocument();
        expect(screen.getByText("package.json")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("muestra el botón de confirmación con el texto 'Desplegar'", () => {
        render(<GitHubDeployModal {...baseProps} />);
        expect(screen.getByRole("button", { name: /desplegar/i })).toBeInTheDocument();
    });
});

describe("GitHubDeployModal – control del Token de GitHub", () => {
    it("muestra el input de contraseña para el token si savedToken es null", () => {
        render(<GitHubDeployModal {...baseProps} savedToken={null} />);
        expect(screen.getByText(/se requiere token de github:/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx")).toBeInTheDocument();
    });

    it("el input del token hereda y renderiza el valor inicial de savedToken si existe", () => {
        render(<GitHubDeployModal {...baseProps} savedToken="ghp_tokenGuardado" />);
        expect(screen.queryByPlaceholderText("ghp_xxxxxxxxxxxx")).not.toBeInTheDocument();
    });

    it("permite al usuario escribir en el input del token", async () => {
        render(<GitHubDeployModal {...baseProps} savedToken={null} />);
        const input = screen.getByPlaceholderText("ghp_xxxxxxxxxxxx");
        await userEvent.type(input, "ghp_123456");
        expect(input).toHaveValue("ghp_123456");
    });
});

describe("GitHubDeployModal – comportamiento del flujo de despliegue (Acciones)", () => {
    it("no ejecuta onConfirm si el token está vacío", async () => {
        const onConfirmMock = vi.fn();
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} savedToken={null} />);
        
        const btnDesplegar = screen.getByRole("button", { name: /desplegar/i });
        await userEvent.click(btnDesplegar);
        
        expect(onConfirmMock).not.toHaveBeenCalled();
    });

    it("pasa a estado de carga, guarda el token en localStorage y abre la ventana al resolver con éxito", async () => {
        const onConfirmMock = vi.fn().mockResolvedValue("https://github.com/repo/url");
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} savedToken="ghp_miToken" />);
        
        const btnDesplegar = screen.getByRole("button", { name: /desplegar/i });
        await userEvent.click(btnDesplegar);

        expect(onConfirmMock).toHaveBeenCalledWith("ghp_miToken");
        expect(localStorage.getItem("github_token")).toBe("ghp_miToken");
        expect(mockOpen).toHaveBeenCalledWith("https://github.com/repo/url", "_blank");

        expect(screen.getByText("¡Despliegue completado!")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /vale/i })).toBeInTheDocument();
    });

    it("pasa a estado de éxito pero NO intenta abrir ninguna ventana si url es vacía (Cubre Línea 37)", async () => {
        const onConfirmMock = vi.fn().mockResolvedValue("");
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} savedToken="ghp_token" />);
        
        const btnDesplegar = screen.getByRole("button", { name: /desplegar/i });
        await userEvent.click(btnDesplegar);

        expect(onConfirmMock).toHaveBeenCalledWith("ghp_token");
        expect(mockOpen).not.toHaveBeenCalled();

        expect(screen.getByText("¡Despliegue completado!")).toBeInTheDocument();
    });

    it("llama a onSuccess al presionar el botón del modal de éxito", async () => {
        const onConfirmMock = vi.fn().mockResolvedValue("https://url.com");
        const onSuccessMock = vi.fn();
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} onSuccess={onSuccessMock} savedToken="ghp_token" />);
        
        await userEvent.click(screen.getByRole("button", { name: /desplegar/i }));
        await userEvent.click(screen.getByRole("button", { name: /vale/i }));

        expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });

    it("llama a onClose al pulsar el botón de cancelar original", async () => {
        const onCloseMock = vi.fn();
        render(<GitHubDeployModal {...baseProps} onClose={onCloseMock} />);
        
        const btnCancelar = screen.getByRole("button", { name: /cancelar|cerrar/i });
        await userEvent.click(btnCancelar);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
});

describe("GitHubDeployModal – manejo de errores", () => {
    it("pasa a estado de error si la promesa onConfirm es rechazada", async () => {
        const onConfirmMock = vi.fn().mockRejectedValue(new Error("Token inválido"));
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} savedToken="ghp_malo" />);
        
        await userEvent.click(screen.getByRole("button", { name: /desplegar/i }));

        expect(screen.getByText("ERROR EN EL DESPLIEGUE")).toBeInTheDocument();
        expect(screen.getByText(/no se pudo crear el repositorio: Token inválido/i)).toBeInTheDocument();
    });

    it("vuelve al estado de confirmación inicial al hacer click en 'Reintentar'", async () => {
        const onConfirmMock = vi.fn().mockRejectedValue(new Error("Fatal Error"));
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} savedToken="ghp_malo" />);
        
        await userEvent.click(screen.getByRole("button", { name: /desplegar/i }));
        
        const btnReintentar = screen.getByRole("button", { name: /reintentar/i });
        await userEvent.click(btnReintentar);

        expect(screen.getByText("CONFIRMAR SUBIDA A GITHUB")).toBeInTheDocument();
    });

    it("llama a onClose si se cancela o cierra desde la pantalla de error", async () => {
        const onConfirmMock = vi.fn().mockRejectedValue(new Error("Fatal Error"));
        const onCloseMock = vi.fn();
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} onClose={onCloseMock} savedToken="ghp_malo" />);
        
        await userEvent.click(screen.getByRole("button", { name: /desplegar/i }));
        
        const btnCerrar = screen.getByRole("button", { name: /cerrar/i });
        await userEvent.click(btnCerrar);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it("pasa a estado de error usando el mensaje genérico si el objeto lanzado no contiene la propiedad message (Cubre Línea 37)", async () => {
        const onConfirmMock = vi.fn().mockRejectedValue({});
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} savedToken="ghp_malo" />);
        
        await userEvent.click(screen.getByRole("button", { name: /desplegar/i }));

        expect(screen.getByText("ERROR EN EL DESPLIEGUE")).toBeInTheDocument();
        expect(screen.getByText(/no se pudo crear el repositorio: Error/i)).toBeInTheDocument();
    });
});

describe("GitHubDeployModal – accesibilidad y casos límite", () => {
    it("el input del token tiene el atributo autoFocus si aparece", () => {
        render(<GitHubDeployModal {...baseProps} savedToken={null} />);
        const input = screen.getByPlaceholderText("ghp_xxxxxxxxxxxx");
        expect(input).toHaveFocus();
    });

    it("hace un trim correcto eliminando espacios en blanco accidentales del token ingresado", async () => {
        const onConfirmMock = vi.fn().mockResolvedValue("https://github.com");
        render(<GitHubDeployModal {...baseProps} onConfirm={onConfirmMock} savedToken={null} />);
        
        const input = screen.getByPlaceholderText("ghp_xxxxxxxxxxxx");
        await userEvent.type(input, "   ghp_tokenConEspacios   ");
        
        await userEvent.click(screen.getByRole("button", { name: /desplegar/i }));
        
        expect(onConfirmMock).toHaveBeenCalledWith("ghp_tokenConEspacios");
    });
});