# PROMPT COMPLETO PARA LA GENERACIÓN DE EXTENSIÓN FUNCIONAL (ENUNCIADO)

Nuestra misión es generar un enunciado tomando el rol de profesores para una asignatura llamada **Diseño y Pruebas** para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más.

Te voy a pasar enunciados de exámenes de otros años junto con el diagrama UML en código Mermaid que lo acompaña, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

* **Rol:** Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
* **Tipos de examen:** Tenemos dos tipos, uno enfocado a una **clínica veterinaria** y otro al **juego del ajedrez**.

### Respecto a los diagramas UML

**Concepto de colores de clases:**
* **Clases negras:** El núcleo del sistema. Clases estables que se usan como contexto, pero que no forman parte de la tarea de implementación. Son la base de la que partimos siempre en todos los exámenes (dominio común).
* **Clases azules:** La base proporcionada. Son clases ya implementadas con las que las clases rojas interactuarán. Pueden estar sujetas a modificaciones para integrar las nuevas funcionalidades. (Nota: En esta tarea no las crearás tú, pero debes saber que existen).
* **Clases rojas:** La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

### Relaciones, cardinalidad y direccionalidad

* **Relaciones rojas entre clases rojas:** El alumno deberá añadir el atributo con su anotación de relación correspondiente.
* **Relaciones rojas entre clases rojas y azules:** El atributo de la relación ya viene dado, el alumno solo tendrá que poner la anotación de relación.
* Tendremos relaciones únicamente **unidireccionales**.
* La cardinalidad podrá ser de `1..1`, `1`, `0..1`, `0..n`, `1..n`. **Las relaciones muchos a muchos no se pedirán en ningún caso.**
* **Límite de 2 entidades de color rojo** (a implementar por completo por el alumno), debido al tiempo disponible para realizar el examen.

---

### Tarea

Sabiendo esto, y entendiéndolo a fondo, cogerás los enunciados de exámenes de ejemplo para usarlos como base en el PDF llamado `“Enunciados de ejemplo”` que te adjunto.

Teniendo estos ejemplos, tu tarea es proporcionarme una **extensión de enunciado nueva que sea funcional** del proyecto **[ajedrez/clínica veterinaria]**, que cumpla estos requisitos:

1.  La extensión funcional deberá añadir alguna **funcionalidad nueva no repetida** en anteriores exámenes (los pasados como ejemplo).
2.  **No se te pide el código Mermaid**, solo el enunciado en texto plano explicando la nueva extensión funcional.
3.  **No añadirás ninguna nota** para el alumno ni para el profesorado.
4.  La extensión funcional devuelta deberá tener la **misma estructura narrativa** que la de los proporcionados como ejemplo (principio y final).
5.  Deberá tener el **mismo nivel de detalle** que los ejemplos, dando breves descripciones de los atributos de las nuevas entidades (rojas) y sus relaciones.
6.  La extensión funcional deberá mantener la base del dominio.
7.  **Sé lo más creativo posible.**
8.  Como te he explicado antes, las clases azules eran generadas por el profesorado como apoyo de la lógica nueva creada, tú no tienes que crear ninguna; simplemente desde la base de clases negras, genera una extensión funcional de clases rojas usando tu creatividad.
9.  No hace falta mencionar el color de las clases que se van a dar, puesto que eso los alumnos lo verán en el diagrama.
10. **Devuélveme directamente el enunciado resultado como si fuera el del examen**, sin comentarios entre medio ni indicaciones concretas generadas por ti.
11. Al no haber clases azules creadas por ti, no deberás decir ninguna información acerca de ellas en el enunciado generado, aunque en los enunciados de ejemplos sí vengan.