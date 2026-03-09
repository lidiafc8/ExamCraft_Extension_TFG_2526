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
| **Total de Pruebas (Logs)** | 3 | 100% |
| ✅ **Éxitos Totales** | 3 | **100%** |
| ⚠️ **Éxito Parcial:** | 0 | **0%** |
| ❌ **Fallos / Alucinaciones** | 0 | **0%** |

## 2. Criterios de Evaluación
*Define aquí qué consideras un "Éxito" y qué un "Fallo". Esto es crucial para la objetividad.*

* ✅ **Éxito:** La respuesta sigue el formato solicitado, no inventa requisitos fuera del dominio, y el resultado es directamente utilizable por un profesor sin apenas edición.
* ⚠️ **Éxito Parcial:** La respuesta es buena pero requiere pequeñas correcciones manuales (ej. formato Markdown roto en una línea).
* ❌ **Fallo:** El modelo alucina (inventa datos irrelevantes), ignora el contexto oculto o no devuelve la salida en el formato esperado.

---

## 3. Análisis por Ejercicio

### 3.1. Enunciado de la Extensión Funcional - Parte 1 (`functional_extension`)
* **Total de pruebas:** 1
* **Ratio de Éxito:** 100%
* **Observaciones Positivas:** 
    - El modelo respeta muy bien el tono académico y usa correctamente los recursos ocultos.
* **Errores Comunes (Fallos):** 
    - No se han encontrado errores comunes en los logs analizados.
* **Propuesta de mejora para el Prompt:** 
    - Sustituir la palabra "NO" por otra similar para evitar la poda de dichos segmentos.

### 3.2. Diagrama UML de la Extensión Funcional - Parte 2 (`UML_diagram`)
* **Total de pruebas:** [X]
* **Ratio de Éxito:** [X]%
* **Observaciones Positivas:** 
* **Errores Comunes (Fallos):**
* **Propuesta de mejora para el Prompt:**

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
| **Clínica Veterinaria** | 1 |  | 1 | 100% | Dominio muy bien comprendido. |
| **Ajedrez** | 1 | 14 | 1 | 100% |  Dominio muy bien comprendido. |

**Conclusión del Dominio:** 

---

## 5. Conclusiones y Próximos Pasos

Seguir desarrollando los diferentes ejercicios y probar para analizar más exhaustivamente el comportamiento del modelo y la madurez de la extensión ante ellos.