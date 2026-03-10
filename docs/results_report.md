# ANÁLISIS DE RESULTADOS Y EVALUACIÓN DE PROMPTS

- **Modelo Evaluado:** API de Gemini
- **Total de Logs Analizados:** 3

---

## Índice
1. [Métricas Globales](#1-métricas-globales)
2. [Criterios de Evaluación](#2-criterios-de-evaluación)
3. [Análisis por Ejercicio](#3-análisis-por-ejercicio)
4. [Análisis por Dominio](#4-análisis-por-dominio)
5. [Conclusiones y Próximos Pasos](#5-conclusiones-y-próximos-pasos)

---

## 1. Métricas Globales

En la siguiente tabla se presenta el ratio general de éxito, éxito parcial y fallo de todas las pruebas realizadas.

| Métrica | Cantidad | Porcentaje |
| :--- | :---: | :---: |
| **Total de Pruebas (Logs)** | 15 | 100% |
| ✅ **Éxitos Totales** | 8 | **53.33%** |
| ⚠️ **Éxito Parcial:** | 5 | **33.33%** |
| ❌ **Fallos / Alucinaciones** | 2 | **13.33%** |

## 2. Criterios de Evaluación

* ✅ **Éxito:** La respuesta sigue el formato solicitado, no inventa requisitos fuera del dominio, y el resultado es directamente utilizable por un profesor sin apenas edición.
* ⚠️ **Éxito Parcial:** La respuesta es buena pero requiere pequeñas correcciones manuales (ej. formato Markdown roto en una línea).
* ❌ **Fallo:** El modelo alucina (inventa datos irrelevantes), ignora el contexto oculto o no devuelve la salida en el formato esperado.

---

## 3. Análisis por Ejercicio

### 3.1. Enunciado de la Extensión Funcional - Parte 1 (`functional_extension`)
* **Total de pruebas:** 8 (5 para Clínica Veterinaria, 3 para Ajedrez)
* **Ratio de Éxito:** 100%
* **Observaciones Positivas:** 
    - El modelo respeta muy bien el tono académico y usa correctamente los recursos ocultos.
* **Errores Comunes (Fallos):** 
    - No se han encontrado errores comunes en los logs analizados.
* **Propuesta de mejora para el Prompt:** 
    - Sustituir la palabra "NO" por otra similar para evitar la poda de dichos segmentos.

### 3.2. Diagrama UML de la Extensión Funcional - Parte 2 (`UML_diagram`)
* **Total de pruebas:** 7 (5 para Clínica Veterinaria, 2 para Ajedrez)
* **Ratio de Éxito:** 0%
* **Observaciones Positivas:** Devuelve el código Mermaid con las relaciones, los colores y los atributos de la forma en la que se le piden, en base a los ejemplos pasados de exámenes anteriores.
* **Errores Comunes (Fallos):** Para el dominio Clínica Veterinaria devuelve bien las clases generales pero a la hora de generar el código Mermaid de las nuevas clases a implementar delira, inventándose clases que no se han mencionado en la extensión funcional y añadiendo atributos que carecen de relación con el examen. Para el dominio Ajedrez, no devuelve nada relacionado con el dominio Ajedrez, el código Mermaid devuelto contiene las clases de Clínica Veterinaria.
* **Propuesta de mejora para el Prompt:** Cammbiar el código devuelto de español a inglés para asegurar consistencia con la extensión funcional origen, además de mejorar las respuestas de este.

### 3.3. Restricciones de atributos - (`attributes_constraints`)
* **Total de pruebas:** [X]
* **Ratio de Éxito:** [X]%
* **Observaciones Positivas:** 
* **Errores Comunes (Fallos):**
* **Propuesta de mejora para el Prompt:**

### 3.4. Relaciones entre entidades - (`entity_relationships`)
* **Total de pruebas:** [X]
* **Ratio de Éxito:** [X]%
* **Observaciones Positivas:** 
* **Errores Comunes (Fallos):**
* **Propuesta de mejora para el Prompt:**
---

## 4. Análisis por Dominio

¿Afecta el tema del examen al rendimiento de la IA?

| Dominio | Ejercicios Probados | Éxitos | Fallos | Tasa de Acierto | Notas |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Clínica Veterinaria** | 2 |  | 1 y 1/2 | 75% | Dominio muy bien comprendido, pero inventa entidades a la hora de la generación del diagrama UML |
| **Ajedrez** | 2 | 1 | 1 | 50% | Dominio no muy bien comprendido, falla en la generación del diagrama UML |

**Conclusión del Dominio:**  Es necesario enfocarse en el dominio Ajedrez para mejorar su rendimiento y sus respuestas.

---

## 5. Conclusiones y Próximos Pasos

- Mejorar el prompt y la comunicación con la librería Mermaid para perfeccionar y corregir los fallos presentes en la generación del Diagrama UML. 
- Seguir desarrollando los diferentes ejercicios y probar para analizar más exhaustivamente el comportamiento del modelo y la madurez de la extensión ante ellos.