import React, { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { SuccessModal } from "./SuccessModal";

interface GitHubDeployModalProps {
    domainName: string;
    templateRepo: string;
    newRepoName: string;
    uploadListString: string;
    savedToken: string | null;
    onConfirm: (token: string) => Promise<string>;
    onSuccess: () => void;
    onClose: () => void;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({
    newRepoName, uploadListString, savedToken, onConfirm, onSuccess, onClose
}) => {
    const [status, setStatus] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm');
    const [token, setToken] = useState(savedToken ?? "");
    const [errorMsg, setErrorMsg] = useState("");

    const handleDeploy = async () => {
        if (!token.trim()) return;
        setStatus('loading');
        try {
            const url = await onConfirm(token.trim());
            
            localStorage.setItem("github_token", token.trim());
            
            if (url) {
                window.open(url, "_blank");
            }

            setStatus('success');
        } catch (e: any) {
            setErrorMsg(e.message || "Error");
            setStatus('error');
        }
    };

    const itemsArray = uploadListString
        .split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');

    if (status === 'success') {
        return (
            <SuccessModal 
                title="¡Despliegue completado!" 
                message="El repositorio ha sido creado y abierto en una nueva pestaña."
                actions={[
                    { label: "Vale", onClick: onSuccess, variant: "primary" }
                ]}
            />
        );
    }

    if (status === 'error') {
        return (
            <ConfirmModal
                title="ERROR EN EL DESPLIEGUE"
                message={`No se pudo crear el repositorio: ${errorMsg}`}
                onConfirm={() => setStatus('confirm')}
                onCancel={onClose}
                confirmLabel="Reintentar"
                cancelLabel="Cerrar"
            />
        );
    }

    return (
        <ConfirmModal
            title="CONFIRMAR SUBIDA A GITHUB"
            message={
                <div style={{ textAlign: "left" }}>
                    <p style={{ marginBottom: "12px" }}>
                        <strong>Repo:</strong> {newRepoName}
                    </p>
                    <p style={{ margin: "0 0 8px 0" }}>Se subirán los siguientes elementos:</p>
                    <ul style={{ margin: "0", paddingLeft: "24px", color: "#4a5568" }}>
                        {itemsArray.map((item) => (
                            <li key={item} style={{ marginBottom: "6px" }}>
                                {item.replace(/^- /, '')}
                            </li>
                        ))}
                    </ul>
                </div>
            }
            warning={!savedToken && (
                <div style={{ marginTop: "16px" }}>
                    <p style={{ marginBottom: "8px", fontWeight: "bold" }}>Se requiere Token de GitHub:</p>
                    <input 
                        type="password" 
                        className="wf-input" 
                        placeholder="ghp_xxxxxxxxxxxx" 
                        value={token} 
                        onChange={e => setToken(e.target.value)} 
                        autoFocus
                        style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
                    />
                </div>
            )}
            onConfirm={handleDeploy}
            onCancel={onClose}
            confirmLabel={status === 'loading' ? "Subiendo..." : "Desplegar"}
        />
    );
};