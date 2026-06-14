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
| 2.1 | 04/06/2026 | Lidia Ning Fernández Casillas | Actualización del documento con nuevos datos para pruebas de validación. |
| 2.2 | 12/06/2026 | María Auxiliadora Quintana Fernández | Actualización del documento con nuevos datos para pruebas de validación. |

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
- **Total de Logs Analizados:** 88

## 1. Métricas Globales Gemini

En la siguiente tabla se presenta el ratio general de éxito, éxito parcial y fallo de todas las pruebas realizadas.

| Métrica | Cantidad | Porcentaje |
| :--- | :---: | :---: |
| **Total de Pruebas (Logs)** | 88 | 100% |
| ✅ **Éxitos Totales** | 74 | **84.09%** |
| ⚠️ **Éxito Parcial:** | 12 | **13.63%** |
| ❌ **Fallos / Alucinaciones** | 2 | **2.27%** |

## 2. Criterios de Evaluación Gemini

* ✅ **Éxito:** La respuesta sigue el formato solicitado, no inventa requisitos fuera del dominio, y el resultado es directamente utilizable por un profesor sin apenas edición.
* ⚠️ **Éxito Parcial:** La respuesta es buena pero requiere pequeñas correcciones manuales (ej. formato Markdown roto en una línea).
* ❌ **Fallo:** El modelo alucina (inventa datos irrelevantes), ignora el contexto oculto o no devuelve la salida en el formato esperado.

---

## 3. Análisis de Partes del Enunciado Gemini

### 3.1. Enunciado de la Extensión Funcional - Parte 1 (`functional_extension`)
* **Total de pruebas:** 15 para Clínica Veterinaria, 11 para Ajedrez
* **Ratio de Éxito:** 86,67% (13/15 Clínica Veterinaria), 91,66% (11/12 Ajedrez) 
* **Observaciones Positivas:** 
    - El modelo respeta muy bien el tono académico y usa correctamente los recursos ocultos.
    - El modelo toma como contexto las extensiones funcionales anteriores almacenadas correctamente y genera otras diferentes.
    - Las extensiones nuevas generadas son creativas y no sufren ninguna alucinación. El modelo entiende correctamente el dominio explicando detalladamente la nueva funcionalidad a implementar.
* **Errores Comunes (Fallos):** 
    - En algunos casos aislados, genera el código Mermaid para el diagrama UML junto con la propuesta de enunciado, a pesar de que se le indica explícitamente que no lo haga.
    - En algunos casos aislados, la respuesta devuelta contiene las restricciones de los atributos y las relaciones entre entidades, aunque no se le pidan explícitamente.

    Estos errores ocurren con muy poca frecuencia y se deben a las variaciones que la IA puede ocasionar. Por este motivo, quedará en responsabilidad del profesor el editar dicha propuesta del modelo para poder adaptarlo a las necesidades personales.
* **Mejoras para el Prompt realizadas:**
    - Susitución de negaciones explícitas por palabras similares para evitar la omisión de instrucciones importantes debido al filtrado que lleva a cabo el modelo.
    - Dotación de memoria para la generación de extensiones nuevas que no se hayan repetido anteriormente con la extensión.
    - Mejora y clarificación de las instrucciones del prompt para la optimización y mejora del entendimiento de la estructura objetivo de la solución a devolver.
    - Especificar en cada atributo solo se le puede dar un nombre.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 3.2. Diagrama UML de la Extensión Funcional - Parte 2 (`UML_diagram`)
* **Total de pruebas:** 14 para Clínica Veterinaria, 12 para Ajedrez
* **Ratio de Éxito:** 50% (7/14 Clínica Veterinaria), 83,33% (10/12 Ajedrez) 
* **Observaciones Positivas:** 
    - Devuelve el código Mermaid con las relaciones y los atributos de la forma en la que se le piden, en base a los ejemplos pasados de exámenes anteriores.
    - El diagrama se renderiza y visualiza de manera correcta en la UI.
    - Los colores de las clases rojas, que son las clases a implementar por el alumno, se colorean correctamente del color indicado junto con las relaciones que salen de estas.
* **Errores Comunes (Fallos):** 
    - Para ambos dominios:
        - No se devuelve el código para establecer el color de cada entidad y relación. (Este fallo ha sido corregido y actualmente no sucede).
        - Crea alguna cardinalidad que no coincide con el contexto generado ni con la lógica.
    - Para Ajedrez:
        - El modelo hay veces en las que no devuelve las clases `ChessBoard`, `ChessMatch`, `Piece`, clases necesarias para construir correctamente el examen. (Este fallo ha sido corregido y actualmente no sucede, devolviendo siempre estas clases necesarias).
* **Mejoras para el Prompt realizadas:**
    - Susitución de negaciones explícitas por palabras similares para evitar la omisión de instrucciones importantes debido al filtrado que lleva a cabo el modelo.
    - Explicitación de instrucciones para la correcta generación del código Mermaid en cuanto a estilos y colores de las clases a implementar.
    - Explicitación de instrucciones con las clases base que siempre deberá devolver debido a los requisitos de cada dominio concreto.
    - Mejora de las instrucciones definidas en el prompt para mejorar el entendimiento de la estructura del código de relaciones, atributos y tipado del diagrama para que se corresponda con la máxima exactitud a los exámenes de ejemplo.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco. 
    

### 3.3. Restricciones de atributos - (`attributes_constraints`)
* **Total de pruebas:** 8 para Clínica Veterinaria, 7 para Ajedrez
* **Ratio de Éxito:** 100% para ambos
* **Observaciones Positivas:** El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Mejoras para el Prompt realizadas:**
    - Susitución de negaciones explícitas por palabras similares para evitar la omisión de instrucciones importantes debido al filtrado que lleva a cabo el modelo.
* **Propuesta de mejora para el Prompt:** 
    - Diferenciación de las restricciones `@NotBlank` y `@NotNull` en los atributos tipo String.
### 3.4. Relaciones entre entidades - (`entity_relationships`)
* **Total de pruebas:** 4 para Clínicia Veterinaria, 3 para Ajedrez
* **Ratio de Éxito:** 100% para Clínicia Veterinaria, 2/3 para Ajedrez
* **Observaciones Positivas:** El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
* **Errores Comunes (Fallos):** 
    - En casos aislados, para el dominio de Ajedrez se ha detectado que la direccionalidad de las relaciones a implementar descritas en el enunciado del ejercicio no se corresponden con la del código Mermaid. (Esto se ha corregido y actualmente funciona correctamente).
* **Mejoras para el Prompt realizadas:**
    - Susitución de negaciones explícitas por palabras similares para evitar la omisión de instrucciones importantes debido al filtrado que lleva a cabo el modelo.
    - Explicitación de instrucciones en el prompt para la correcta generación del enunciado del ejercicio para que tenga una correspondencia exacta con lo descrito en el diagrama UML de la extensión funcional.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

---

## 4. Análisis de Partes de Código Gemini

### 4.1. Código Clases Base (`base_classes_code`)
* **Total de pruebas:** 6 para Clínica Veterinaria, 6 para Ajedrez
* **Ratio de Éxito:** 100% para ambos
* **Observaciones Positivas:** 
    - El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
    - Entendimiento correcto de la estructura de nombres de paquetes y código.
    - Correspondiencia correcta con el examen base para el que se crea el código.
* **Errores Comunes (Fallos):** 
    - En el código devuelto, en casos aislados devuelve las entidades ya anotadas con `@Entity`cuando no debería puesto que es una anotación a poner por el alumno. (Esto ha sido corregido y el funcionamiento es el correcto).
    - En el código devuelto, en casos aislados, los repositorios ya extienden a `CrudRepository`cuando no debería puesto que es una anotación a poner por el alumno. (Esto ha sido corregido y el funcionamiento es el correcto).
* **Mejoras para el Prompt realizadas:**
    - Susitución de negaciones explícitas por palabras similares para evitar la omisión de instrucciones importantes debido al filtrado que lleva a cabo el modelo.
    - Explicitación de anotaciones que el modelo no debe devolver dentro del código base que devuelve, aunque estos se especifiquen en los ejemplos pasados como contexto. El objetivo de esto es evitar cualquier fallo menor.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 4.2. Código de Tests de "Restricciones de Atributos" (`tests_attribute_constraints_code`)
* **Total de pruebas:** 5 para Clínica Veterinaria, 6 para Ajedrez
* **Ratio de Éxito:** 100% para ambos
* **Observaciones Positivas:** 
    - El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
    - Entendimiento correcto de la estructura de nombres de paquetes y código.
    - Correspondiencia correcta con el examen base para el que se crea el código y las clases base que debe comprobar.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Mejoras para el Prompt realizadas:**
    - Susitución de negaciones explícitas por palabras similares para evitar la omisión de instrucciones importantes debido al filtrado que lleva a cabo el modelo.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 4.3. Código de Tests de "Relaciones entre Entidades" (`tests_entity_relationships_code`)
* **Total de pruebas:** 5 para Clínica Veterinaria, 6 para Ajedrez
* **Ratio de Éxito:** 100% para ambos
* **Observaciones Positivas:** 
    - El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
    - Entendimiento correcto de la estructura de nombres de paquetes y código.
    - Correspondiencia correcta con el examen base para el que se crea el código y las clases base que debe comprobar.
* **Errores Comunes (Fallos):** No se han visualizado errores hasta el momento.
* **Mejoras para el Prompt realizadas:**
    - Susitución de negaciones explícitas por palabras similares para evitar la omisión de instrucciones importantes debido al filtrado que lleva a cabo el modelo.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

### 4.4. Código Solución (`solution_code`)
* **Total de pruebas:** 5 para Clínica Veterinaria, 6 para Ajedrez
* **Ratio de Éxito:** 100% para ambos
* **Observaciones Positivas:** 
    - El modelo entiende bien las directrices y utiliza los ejemplos proporcionados para devolver la estructura solicitada.
    - Entendimiento correcto de la estructura de nombres de paquetes y código.
    - Correspondiencia correcta con el examen base para el que se crea el código.
* **Errores Comunes (Fallos):**
    - Algunas veces se ha observado que el modelo genera comentarios que dan algunas explicaciones del código implementado. Esto se ha prohibido estrictamente en el prompt pero aun así, a veces genera este tipo de comentarios explicativos. Puesto que sucede en la parte del código solución, código que está pensando que sea únicamente accesible por el profesorado, no presenta ningún riesgo en la fiabilidad del sistema.
* **Mejoras para el Prompt realizadas:**
    - Susitución de negaciones explícitas por palabras similares para evitar la omisión de instrucciones importantes debido al filtrado que lleva a cabo el modelo.
* **Propuesta de mejora para el Prompt:** Intencionadamente en blanco.

---

## 5. Análisis por Dominio Gemini

¿Afecta el tema del examen al rendimiento de la IA?

| Dominio | Partes Probadas | Éxitos | Fallos | Tasa de Acierto | Notas |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Clínica Veterinaria** | 10 (enunciado, diagrama UML, restricciones de atributos, relaciones entre entidades, clases base, tests (2) y código solución)| 10 | 0 | 100% | Intencionadamente en blanco. |
| **Ajedrez** | 11 (enunciado, diagrama UML, restricciones de atributos, relaciones entre entidades, clases base, tests (2) y código solución) | 11 | 0 | 100% | Intencionadamente en blanco. |

**Conclusión del Dominio:** En este momento ambos dominios son comprendidos de manera correcta independientemente del tema que se trate en el mismo, siendo el nivel de creatividad y adaptación bastante óptimo para cada uno de los dominios.

---

## 6. Conclusiones y Próximos Pasos Gemini

- Seguir generando más exámenes de prueba para analizar más exhaustivamente el comportamiento del modelo y la madurez de la extensión ante ellos.

<br>
<br>

---

# PARTE II: Evaluación Modelo ChatGPT

- **Modelo Evaluado:** API de ChatGPT (OpenAI)
- **Total de Logs Analizados:** 0 (Evaluación cualitativa basada en pruebas informales durante el desarrollo)

## 1. Métricas Globales ChatGPT

En la siguiente tabla se presenta el ratio general de éxito, éxito parcial y fallo de todas las pruebas realizadas. Cabe destacar que, al intentar iniciar las pruebas formales con este modelo, la cuota de la API de OpenAI se vio completamente sobrepasada, impidiendo el registro automatizado de logs. Por tanto, los datos cuantitativos se mantienen a cero y las conclusiones se basan en la experiencia empírica del equipo de desarrollo.

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

- Por el momento el modelo de Open AI se está utilizando como alternativa en el caso de que el modelo Gemini falle o exceda las cuotas disponibles. Sin embargo, en las pruebas realizadas con el mismo se comprueba que el nivel de entendimiento y acierto es mucho peor que Gemini, cometiendo errores al entender el prompt a pesar de que se le especifica explícitamente todas las instrucciones en los diferentes prompts. 

- Es crucial matizar que, debido a que la cuota de la API se vio sobrepasada al intentar iniciar la suite de testeo formal, las conclusiones a las que se ha llegado con respecto a este modelo son en base a las pruebas informales realizadas durante el desarrollo de la extensión y a lo que las desarrolladoras recuerdan de la interacción directa en consola, no existiendo un registro formal de logs en el sistema para OpenAI. Por este motivo, se establece la ejecución de estas pruebas formales como un punto de extensión y trabajo futuro del proyecto. Mientras tanto, se optará siempre que las condiciones lo permitan por el uso de Gemini, siendo este el modelo con el que se entrenaron inicialmente los prompts.