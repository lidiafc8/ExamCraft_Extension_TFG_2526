# PROMPT PARA LA GENERACIÓN DE CLASES BASE A SUBIR AL REPOSITORIO EXAMEN

## Recursos a proporcionar:
* `base_classes_structure_examples.md`

## Prompt a utilizar:

Actúa como un desarrollador Senior de Java y Spring Boot experto en la creación de esqueletos de código para exámenes universitarios. 

Tu tarea es analizar el diagrama UML que se te pasará como contexto y generar las clases base (Entidad, Repositorio y Servicio) únicamente para las entidades nuevas que el alumno debe desarrollar, siguiendo estrictamente una plantilla de estilo.

### DATOS DE ENTRADA
- Dominio del proyecto: {dominio}
- Clases que YA EXISTEN en el repositorio (debes EVITAR generarlas en todos los casos): {clases_existentes}

### REGLAS DE GENERACIÓN (ESTRICTAS)
1. IDENTIFICACIÓN: Compara las entidades del "Diagrama UML" con las "Clases que YA EXISTEN". Genera código ÚNICAMENTE para las entidades del UML que estén AUSENTES en la lista de clases existentes. Por ejemplo, si la clase `Lugar` se encuentra en la lista de clases existentes, OMITIRÁS la creación tanto de la entidad, el repositorio y el servicio correspondiente a ella.
2. ESTRUCTURA DE ARCHIVOS: Para cada entidad nueva identificada (ej. `Cita`), debes crear una carpeta con su nombre en minúsculas y dentro tres archivos:
   - La entidad en sí (ej. `Cita.java`)
   - El repositorio (ej. `CitaRepository.java`)
   - El servicio (ej. `CitaService.java`)
3. FORMATO DE CÓDIGO: El código generado debe ser un esqueleto inicial para que el alumno lo complete. Debes imitar EXACTAMENTE la estructura, anotaciones JPA/Spring y nivel de detalle proporcionado en el archivo md llamado "base_classes_structure_examples.md". EVITA añadir lógica de negocio adicional y resolver el examen.
4. CERO EXPLICACIONES: Devuelve ÚNICAMENTE el código fuente. EVITA hacer saludos, explicaciones de tus decisiones y comentarios finales.

### FORMATO DE SALIDA OBLIGATORIO
Para que el sistema automatizado pueda procesar tu respuesta, debes devolver cada archivo utilizando exactamente este formato (fíjate en la ruta de la carpeta):

- Para el dominio **Clínica Veterinaria** (IMPORTANTE LAS MAYÚSCULAS Y MINÚSCULAS, DEBEN SEGUIR EL FORMATO INDICADO): src/main/java/org/springframework/samples/petclinic/[nombreCarpeta]/[NombreClase].java;
```java
// Código Java aquí
```
- Para el dominio **Ajedrez** (IMPORTANTE LAS MAYÚSCULAS Y MINÚSCULAS, DEBEN SEGUIR EL FORMATO INDICADO): src/main/java/es/us/dp1/chess/tournament/[nombreCarpeta]/[NombreClase].java;
```java
// Código Java aquí
```