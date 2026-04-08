import React from 'react';
// IMPORTANTE: Verifica que esta ruta apunte bien a tu imagen de logo.
// Como usas alias en tu proyecto (~src), esta ruta debería funcionar desde cualquier lado.
import logoExamCraft from "../../assets/icon512.png"

export interface BreadcrumbItem {
    label: string;
    action: () => void;
}

interface HeaderProps {
    onWelcome: () => void;
    breadcrumbItems: BreadcrumbItem[];
    currentStep: string;
}

export const Header: React.FC<HeaderProps> = ({ onWelcome, breadcrumbItems, currentStep }) => {
    
    // Los estilos que tenías en tu archivo original
    const breadcrumbButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        color: '#4a3728',
        cursor: 'pointer',
        display: 'inline',
        outline: 'none'
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <button 
                    type="button"
                    className="logo-icon" 
                    onClick={onWelcome} 
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
                    aria-label="Ir a inicio"
                >
                    <img src={logoExamCraft} alt="Logo ExamCraft" width="60" height="60" />
                </button>

                <nav className="breadcrumb-nav">
                    {breadcrumbItems.map((item) => (
                        <React.Fragment key={item.label}>
                            <button type="button" style={breadcrumbButtonStyle} onClick={item.action}>
                                {item.label}
                            </button>
                            <span className="breadcrumb-separator">{' > '}</span>
                        </React.Fragment>
                    ))}
                    <span className="breadcrumb-current">{currentStep}</span>
                </nav>
            </div>
        </header>
    );
};