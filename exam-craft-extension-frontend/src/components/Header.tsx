import React from "react"

import logoExamCraft from "../../assets/icon512.png"

import "./css/Header.css"

export interface BreadcrumbItem {
  label: string
  action: () => void
}

interface HeaderProps {
  onWelcome: () => void
  breadcrumbItems: BreadcrumbItem[]
  currentStep: string
}

export const Header: React.FC<HeaderProps> = ({
  onWelcome,
  breadcrumbItems,
  currentStep
}) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="logo-icon"
          onClick={onWelcome}
          aria-label="Ir a inicio">
          <img
            src={logoExamCraft}
            alt="Logo ExamCraft"
            width="60"
            height="60"
          />
        </button>

        <nav className="breadcrumb-nav">
          {breadcrumbItems.map((item) => (
            <React.Fragment key={item.label}>
              <button
                type="button"
                className="breadcrumb-button"
                onClick={item.action}>
                {item.label}
              </button>
              <span className="breadcrumb-separator">{" > "}</span>
            </React.Fragment>
          ))}
          <span className="breadcrumb-current">{currentStep}</span>
        </nav>
      </div>
    </header>
  )
}
