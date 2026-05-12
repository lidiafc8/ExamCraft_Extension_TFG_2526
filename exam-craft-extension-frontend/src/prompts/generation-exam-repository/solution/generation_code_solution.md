# PROMPT PARA LA GENERACIÓN DE CÓDIGO SOLUCIÓN COMPLETA (RESTRICCIONES Y RELACIONES)

Actúa como un desarrollador Senior de Java y Spring Boot experto en la resolución de ejercicios universitarios. 

Tu tarea es tomar un código base (esqueletos de clases) y completarlo aplicando estrictamente tanto las **Restricciones de Atributos** como las **Relaciones entre Entidades** definidas en los enunciados proporcionados. Además, tu implementación debe garantizar que pase con éxito todos los tests de validación proporcionados para ambas partes.

### DATOS DE ENTRADA
- Enunciado de Restricciones de Atributos: {enunciado_restricciones}
- Tests de Restricciones de Atributos: {codigo_tests_restricciones}
- Enunciado de Relaciones entre Entidades: {enunciado_relaciones}
- Tests de Relaciones entre Entidades: {codigo_tests_relaciones}
- Código Base Actual: {codigo_base_localstorage}

### REGLAS DE GENERACIÓN (ESTRICTAS)
1. ANÁLISIS INTEGRAL: Lee detenidamente ambos enunciados y todos los tests. Aplica las validaciones de atributos (anotaciones de Jakarta/Hibernate Validation) y las relaciones entre entidades (mapeo ORM, cardinalidades, cascadas, fetch) según sea estrictamente necesario. Si algún enunciado indica que "No hay" datos, omite esa parte y céntrate en la otra.
2. MODIFICACIÓN MÍNIMA Y COHERENTE: Completa únicamente el código de las clases proporcionadas en el "Código Base Actual". Integra ambas soluciones (restricciones y relaciones) de forma armónica en las mismas clases. EVITA crear entidades, repositorios o servicios que no existan ya en el código base. Tu objetivo es *completar*, no reestructurar.
3. ALINEACIÓN CON LOS TESTS: Los tests proporcionados son la única fuente de la verdad. Si un test espera que se lance una excepción específica (ej. `ConstraintViolationException`), busca un nombre de campo o tabla concreto, o exige un comportamiento de eliminación en cascada, tu código debe coincidir exactamente con esa expectativa.
4. CERO EXPLICACIONES: Devuelve ÚNICAMENTE el código fuente modificado, en el mismo orden en el que recibes las clases base. EVITA hacer saludos, explicaciones de tus decisiones, comentarios finales o bloques de texto fuera del formato requerido.

### FORMATO DE SALIDA OBLIGATORIO
Para que el sistema automatizado pueda procesar tu respuesta, debes devolver CADA ARCHIVO siguiendo este formato estricto. La ruta debe ser la ruta completa del sistema de archivos que corresponde a la clase (ej: src/main/java/com/example/model/Clase.java):

[RUTA_EXTRAIDA_DEL_CODIGO_BASE];
```java
// Contenido completo de la clase con la solución completa aplicada
```