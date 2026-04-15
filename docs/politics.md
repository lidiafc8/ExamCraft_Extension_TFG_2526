# Política de Desarrollo y Colaboración - ExamCraft Extension

Este parrafo define los estándares, herramientas y flujos de trabajo acordados por el equipo para el desarrollo del TFG.

## 1. Stack Tecnológico y Herramientas

* **Comunicación interna:** WhatsApp y Discord.
* **Comunicación con tutores:** Microsoft Teams.
* **Gestión de Proyecto:** Scrum y ZenHub.
* **Diagramas:** Mermaid.
* **Documentación:** LaTeX.
* **Framework de Desarrollo:** Plasmo (Target: `chrome-mv3`).

---

## 2. Normas del Repositorio e Idiomas

Para mantener la coherencia, se respetarán los siguientes idiomas según el contexto:

* **Ramas (Branches):** Inglés.
* **Código Fuente:** Inglés.
* **Commits e Issues:** Español.

---

## 3. Flujo de Trabajo (Git Flow)

Se sigue la metodología **Git Flow** con las siguientes reglas específicas:

### Gestión de Ramas
* **Versiones estables:** Las ramas `main` y `develop` siempre deben contener versiones funcionales.
* **Releases:**
    * Se deben enviar cambios a `main` y generar una *release* mínimo **1 vez por sprint**.

### Pull Requests (PR) y Revisiones
* Es obligatorio trabajar con **Pull Requests**.
* **Regla de aprobación:** La PR debe ser creada por un miembro y **admitida/revisada obligatoriamente por la otra persona** del equipo antes de fusionarse.

---

## 4. Gestión de Tareas (ZenHub)

### Tipos de Issues (Pipelines)
* `feature`: Nuevas funcionalidades.
* `bug`: Errores o fallos.
* `task`: Tareas generales. Se debe especificar si es para **documentación** o **test**.

### Priorización (Labels)
* **Prioridad:** Se debe asignar una etiqueta de prioridad: `low`, `medium` o `high`.
* **Tipo de Tarea:** Si el issue es una `task`, especificar etiqueta `documentation` o `test`.

---
## 5. Política de Commits

### Estructura del Mensaje
El asunto del commit debe seguir estrictamente el siguiente formato:

> **`<tipo>: <breve descripción>`**

### Configuración
Se utilizará una plantilla de commit configurada en el entorno local para asegurar este formato:
```bash
git config commit.template .gitmessage
git config --global core.editor "code --wait"