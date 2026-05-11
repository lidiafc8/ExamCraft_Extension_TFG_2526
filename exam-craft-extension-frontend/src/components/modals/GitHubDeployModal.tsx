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
    domainName, templateRepo, newRepoName, uploadListString, savedToken, onConfirm, onSuccess, onClose
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
            message={`Repo: ${newRepoName}\n\nSe subirán:\n${uploadListString}`}
            warning={!savedToken && (
                <div>
                    <p>Se requiere Token de GitHub:</p>
                    <input 
                        type="password" 
                        className="wf-input" 
                        placeholder="ghp_xxxxxxxxxxxx" 
                        value={token} 
                        onChange={e => setToken(e.target.value)} 
                        autoFocus
                    />
                </div>
            )}
            onConfirm={handleDeploy}
            onCancel={onClose}
            confirmLabel={status === 'loading' ? "Subiendo..." : "Desplegar"}
        />
    );
};