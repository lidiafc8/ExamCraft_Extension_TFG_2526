# Report de Resultados — ExamCraft

![Logo ExamCraft](../exam-craft-extension-frontend/assets/icon512.png)

<br>
<br>

# CONTROL DE VERSIONES

| Versión | Fecha | Autor(es) | Descripción de Cambios |
| :---: | :---: | :--- | :--- |
| 1.0 | 04/03/2026 | Lidia Ning Fernández Casillas | Creación del documento base y primera evaluación estructurada del modelo Gemini. |
| 1.1 | 10/03/2026 | Lidia Ning Fernández Casillas | Actualización del documento con nuevos datos. |
| 1.2 | 29/03/2026 | Lidia Ning Fernández Casillas | Mejora de estructura de logs y actualización correspondiente en el documento. |
| 2.0 | 04/05/2026 | Lidia Ning Fernández Casillas | Actualización del documento con nuevos datos y creación de plantilla para ChatGPT. |

---
<br>
<br>

# ANÁLISIS DE RESULTADOS Y EVALUACIÓN DE PROMPTS

## Índice General

### [PARTE I: Evaluación Modelo Gemini](#parte-i-evaluación-modelo-gemini)
1. [Métricas Globales Gemini](#1-métricas-globales-gemini)
2. [Criterios de Evaluación Gemini](#2-criterios-de-evaluación-gemini)
3. [Análisis de Partes del Enunciado Gemini](#3-análisis-de-partes-del-enunciado-gemini)
4. [Análisis de Partes de Código Gemini](#4-análisis-de-partes-de-código-gemini)
5. [Análisis por Dominio Gemini](#5-análisis-por-dominio-gemini)
6. [Conclusiones y Próximos Pasos Gemini](#6-conclusiones-y-próximos-pasos-gemini)

### [PARTE II: Evaluación Modelo ChatGPT](#parte-ii-evaluación-modelo-chatgpt)
1. [Métricas Globales ChatGPT](#1-métricas-globales-chatgpt)
2. [Criterios de Evaluación ChatGPT](#2-criterios-de-evaluación-chatgpt)
3. [Análisis de Partes del Enunciado ChatGPT](#3-análisis-de-partes-del-enunciado-chatgpt)
4. [Análisis de Partes de Código ChatGPT](#4-análisis-de-partes-de-código-chatgpt)
5. [Análisis por Dominio ChatGPT](#5-análisis-por-dominio-chatgpt)
6. [Conclusiones y Próximos Pasos ChatGPT](#6-conclusiones-y-próximos-pasos-chatgpt)

---

# PARTE I: Evaluación Modelo Gemini

- **Modelo Evaluado:** API de Gemini
- **Total de Logs Analizados:** 43

## 1. Métricas Globales Gemini

En la siguiente tabla se presenta el ratio general de éxito, éxito parcial y fallo de todas las pruebas realizadas.

| Métrica | Cantidad | Porcentaje |
| :--- | :---: | :---: |
| **Total de Pruebas (Logs)** | 43 | 100% |
| ✅ **Éxitos Totales** | 33 | **76.74%** |
| ⚠️ **Éxito Parcial:** | 8 | **18.60%** |
| ❌ **Fallos / Alucinaciones** | 2 | **4.65%** |

## 2. Criterios de Evaluación Gemini

* ✅ **Éxito:** La respuesta sigue el formato solicitado, no inventa requisitos fuera del dominio, y el resultado es directamente utilizable por un profesor sin apenas edición.
* ⚠️ **Éxito Parcial:** La respuesta es buena pero requiere pequeñas correcciones manuales (ej. formato Markdown roto en una línea).
* ❌ **Fallo:** El modelo alucina (inventa datos irrelevantes), ignora el contexto oculto o no devuelve la salida en el formato esperado.

---

## 3. Análisis de Partes del Enunciado Gemini

### 3.1. Enunciado de la Extensión Funcional - Parte 1 (`functional_extension`)
* **Total de pruebas:** 10 para Clínica Veterinaria, 7 para Ajedrez
* **Ratio de Éxito:** 80% (8/10 Clínica Veterinaria), 100% (7/7 Ajedrez) 
* **Observaciones Positivas:** - El modelo respeta muy bien el tono académico y usa correctamente los recursos ocultos.
    - El modelo toma como contexto las extensiones funcionales anteriores almacenadas correctamente y genera otras diferentes.
* **Errores Comunes (Fallos):** 
    - En algunos casos aislados, genera el código Mermaid para el diagrama UML junto con la propuesta de enunciado, a pesar de que se le indica explícitamente que no lo haga.
    - En algunos casos aislados, la respuesta devuelta contiene las restricciones de los atributos y las relaciones entre entidades, aunque no se le pidan explícitamente.

    Estos errores ocurren con muy poca frecuencia y se deben a las variaciones que la IA puede ocasionar. Por este motivo, quedará en responsabilidad del profesor el editar dicha propuesta del modelo para poder adaptarlo a las necesidades personales.

* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 3.2. Diagrama UML de la Extensión Funcional - Parte 2 (`UML_diagram`)
* **Total de pruebas:** 9 para Clínica Veterinaria, 6 para Ajedrez
* **Ratio de Éxito:** 33.33% (3/9 Clínica Veterinaria), 71,42% (5/7 Ajedrez) 
* **Observaciones Positivas:** 
    - Devuelve el código Mermaid con las relaciones y los atributos de la forma en la que se le piden, en base a los ejemplos pasados de exámenes anteriores.
    - El diagrama se renderiza y visualiza de manera correcta en la UI.
* **Errores Comunes (Fallos):** - Para ambos dominios:
        - No se devuelve el código para establecer el color de cada entidad y relación.
    - Para Ajedrez:
        - El modelo hay veces en las que no devuelve las clases `ChessBoard`, `ChessMatch`, `Piece`, clases necesarias para construir correctamente el examen.
* **Propuesta de mejora para el Prompt:** 
    - Explicitar la generación de estilos en la repuesta.
    - Explicitar generar para el dominio Ajedrez siempre las 3 clases necesarias mencionadas.

### 3.3. Restricciones de atributos - (`attributes_constraints`)
* **Total de pruebas:** 3 para Clínica Veterinaria, 2 para Ajedrez
* **Ratio de Éxito:** 100% para ambos
* **Observaciones Positivas:** El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 3.4. Relaciones entre entidades - (`entity_relationships`)
* **Total de pruebas:** 1 para Ajedrez
* **Ratio de Éxito:** 100%
* **Observaciones Positivas:** El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

---

## 4. Análisis de Partes de Código Gemini

### 4.1. Código Clases Base (`base_classes_code`)
* **Total de pruebas:** 1 para Ajedrez
* **Ratio de Éxito:** 100%
* **Observaciones Positivas:** 
    - El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
    - Entendimiento correcto de la estructura de nombres de paquetes y código.
    - Correspondiencia correcta con el examen base para el que se crea el código.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 4.2. Código de Tests de "Restricciones de Atributos" (`tests_attribute_constraints_code`)
* **Total de pruebas:** 1 para Ajedrez
* **Ratio de Éxito:** 100%
* **Observaciones Positivas:** 
    - El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
    - Entendimiento correcto de la estructura de nombres de paquetes y código.
    - Correspondiencia correcta con el examen base para el que se crea el código y las clases base que debe comprobar.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 4.3. Código de Tests de "Relaciones entre Entidades" (`tests_entity_relationships_code`)
* **Total de pruebas:** 1 para Ajedrez
* **Ratio de Éxito:** 100%
* **Observaciones Positivas:** 
    - El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
    - Entendimiento correcto de la estructura de nombres de paquetes y código.
    - Correspondiencia correcta con el examen base para el que se crea el código y las clases base que debe comprobar.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 4.4. Código Solución (`solution_code`)
* **Total de pruebas:** 1 para Ajedrez
* **Ratio de Éxito:** 100%
* **Observaciones Positivas:** 
    - El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
    - Entendimiento correcto de la estructura de nombres de paquetes y código.
    - Correspondiencia correcta con el examen base para el que se crea el código.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

---

## 5. Análisis por Dominio Gemini

¿Afecta el tema del examen al rendimiento de la IA?

| Dominio | Ejercicios Probados | Éxitos | Fallos | Tasa de Acierto | Notas |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Clínica Veterinaria** | 3 | 3 | 0 | 100% | Intencionadamente en blanco. |
| **Ajedrez** | 3 | 3 | 0 | 100% | Intencionadamente en blanco. |

**Conclusión del Dominio:** En este momento ambos dominios son comprendidos de manera correcta. 

---

## 6. Conclusiones y Próximos Pasos Gemini

- Seguir generando más exámenes de prueba para analizar más exhaustivamente el comportamiento del modelo y la madurez de la extensión ante ellos.

<br>
<br>

---

# PARTE II: Evaluación Modelo ChatGPT

- **Modelo Evaluado:** API de ChatGPT (OpenAI)
- **Total de Logs Analizados:** [Completar]

## 1. Métricas Globales ChatGPT

En la siguiente tabla se presenta el ratio general de éxito, éxito parcial y fallo de todas las pruebas realizadas.

| Métrica | Cantidad | Porcentaje |
| :--- | :---: | :---: |
| **Total de Pruebas (Logs)** | [0] | 100% |
| ✅ **Éxitos Totales** | [0] | **0.00%** |
| ⚠️ **Éxito Parcial:** | [0] | **0.00%** |
| ❌ **Fallos / Alucinaciones** | [0] | **0.00%** |

## 2. Criterios de Evaluación ChatGPT

* ✅ **Éxito:** La respuesta sigue el formato solicitado, no inventa requisitos fuera del dominio, y el resultado es directamente utilizable por un profesor sin apenas edición.
* ⚠️ **Éxito Parcial:** La respuesta es buena pero requiere pequeñas correcciones manuales (ej. formato Markdown roto en una línea).
* ❌ **Fallo:** El modelo alucina (inventa datos irrelevantes), ignora el contexto oculto o no devuelve la salida en el formato esperado.

---

## 3. Análisis de Partes del Enunciado ChatGPT

### 3.1. Enunciado de la Extensión Funcional - Parte 1 (`functional_extension`)
* **Total de pruebas:** [0] para Clínica Veterinaria, [0] para Ajedrez
* **Ratio de Éxito:** [0]% ([0]/[0] Clínica Veterinaria), [0]% ([0]/[0] Ajedrez) 
* **Observaciones Positivas:** - [Completar]
* **Errores Comunes (Fallos):** - [Completar]
* **Propuesta de mejora para el Prompt:** [Completar]

### 3.2. Diagrama UML de la Extensión Funcional - Parte 2 (`UML_diagram`)
* **Total de pruebas:** [0] para Clínica Veterinaria, [0] para Ajedrez
* **Ratio de Éxito:** [0]% ([0]/[0] Clínica Veterinaria), [0]% ([0]/[0] Ajedrez) 
* **Observaciones Positivas:** - [Completar]
* **Errores Comunes (Fallos):** - [Completar]
* **Propuesta de mejora para el Prompt:** [Completar]

### 3.3. Restricciones de atributos - (`attributes_constraints`)
* **Total de pruebas:** [0] para Clínica Veterinaria, [0] para Ajedrez
* **Ratio de Éxito:** [0]%
* **Observaciones Positivas:** - [Completar]
* **Errores Comunes (Fallos):** - [Completar]
* **Propuesta de mejora para el Prompt:** [Completar]

### 3.4. Relaciones entre entidades - (`entity_relationships`)
* **Total de pruebas:** [0] para Clínica Veterinaria, [0] para Ajedrez
* **Ratio de Éxito:** [0]%
* **Observaciones Positivas:** - [Completar]
* **Errores Comunes (Fallos):** - [Completar]
* **Propuesta de mejora para el Prompt:** [Completar]

---

## 4. Análisis de Partes de Código ChatGPT

### 4.1. Código Clases Base (`base_classes_code`)
* **Total de pruebas:** [0]
* **Ratio de Éxito:** [0]%
* **Observaciones Positivas:** - [Completar]
* **Errores Comunes (Fallos):** - [Completar]
* **Propuesta de mejora para el Prompt:** [Completar]

### 4.2. Código de Tests de "Restricciones de Atributos" (`tests_attribute_constraints_code`)
* **Total de pruebas:** [0]
* **Ratio de Éxito:** [0]%
* **Observaciones Positivas:** - [Completar]
* **Errores Comunes (Fallos):** - [Completar]
* **Propuesta de mejora para el Prompt:** [Completar]

### 4.3. Código de Tests de "Relaciones entre Entidades" (`tests_entity_relationships_code`)
* **Total de pruebas:** [0]
* **Ratio de Éxito:** [0]%
* **Observaciones Positivas:** - [Completar]
* **Errores Comunes (Fallos):** - [Completar]
* **Propuesta de mejora para el Prompt:** [Completar]

### 4.4. Código Solución (`solution_code`)
* **Total de pruebas:** [0]
* **Ratio de Éxito:** [0]%
* **Observaciones Positivas:** - [Completar]
* **Errores Comunes (Fallos):** - [Completar]
* **Propuesta de mejora para el Prompt:** [Completar]

---

## 5. Análisis por Dominio ChatGPT

¿Afecta el tema del examen al rendimiento de la IA?

| Dominio | Ejercicios Probados | Éxitos | Fallos | Tasa de Acierto | Notas |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Clínica Veterinaria** | [0] | [0] | [0] | [0]% | [Completar] |
| **Ajedrez** | [0] | [0] | [0] | [0]% | [Completar] |

**Conclusión del Dominio:** [Completar]

---

## 6. Conclusiones y Próximos Pasos ChatGPT

- Por el momento el modelo de Open AI se está utilizando como alternativa en el caso de que el modelo Gemini falle o exceda las cuotas disponibles. Sin embargo, en las pruebas realizadas con el mismo se comprueba que el nivel de entendimiento y acierto es mucho peor que Gemini, cometiendo errores al entender el prompt a pesar de que se le especifica explícitamente todas las instrucciones en los diferentes prompts. Por este motivo, se optará si las condiciones lo permiten el uso de Gemini, siendo este modelo con el que se hizo inicialmente el entrenamiento de prompts.