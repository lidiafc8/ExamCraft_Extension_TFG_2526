# PROMPT COMPLETO PARA LA GENERACIÓN DE EXTENSIÓN FUNCIONAL (ENUNCIADO)

## Recursos a proporcionar:
* `EXTENSIONES FUNCIONALES DE EJEMPLO.pdf`

## Prompt a utilizar:

Nuestra misión es generar un enunciado tomando el rol de profesores para una asignatura llamada Diseño y Pruebas para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Te voy a pasar enunciados de exámenes de otros años junto con el diagrama UML en código Mermaid que lo acompaña, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

* Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
* Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.
* Respecto a los diagramas UML que te pasaré junto con los ejemplos:

     - Concepto de colores de clases:  

         - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que no forma parte de la tarea de implementación. 

         - **Clases azules**: La base proporcionada. Son clases ya implementadas con las que las clases rojas interactuarán. Pueden estar sujetas a modificaciones para integrar las nuevas funcionalidades.

         - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

         - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando. Las azules son clases que el profesorado al crear las nuevas extensiones necesitaba para que hubiese un sentido lógico en la funcionalidad y las rojas, pueden variar según la extensión funcional que se le añada.

     - Relaciones, cardinalidad y direccionalidad.
         - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

         - Relaciones rojas entre clases rojas y azules: el atributo de la relación ya viene dado, el alumno solo tendrá que poner la anotación de relación

         - Tendremos relaciones únicamente unidireccionales.

         - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos no se pedirán en ningún caso.

* Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

Sabiendo esto, y entendiéndolo a fondo, cogerás los enunciados de exámenes de ejemplo para usarlos como base en el pdf llamado “Extensiones funcionales de ejemplo” que te adjunto.

Teniendo estos ejemplos, tu tarea es proporcionarme una extensión de enunciado nueva que sea funcional del proyecto **[ajedrez/clínica veterinaria]**, que cumpla estos requisitos:

*	La extensión funcional deberá añadir alguna funcionalidad nueva no repetida en anteriores exámenes, es decir, los exámenes pasados como ejemplo.

*	No se te pide el código Mermaid, solo el enunciado en texto plano explicando la nueva extensión funcional.

*	No añadirás ninguna nota para el alumno ni para el profesorado.

*	La extensión funcional devuelta deberá tener la misma estructura narrativa que la de los proporcionados como ejemplo, tanto el principio como el final del enunciado.

*	La extensión funcional devuelta deberá tener el mismo nivel de detalle que los proporcionados como ejemplo, ni más ni menos, dando breves descripciones de los atributos de las nuevas entidades (rojas) y sus relaciones.

*	La extensión funcional deberá mantener la base del dominio.

*	Sé lo más creativo posible.

*	Como te he explicado antes, las clases azules eran generadas por el profesorado como apoyo de la lógica nueva creada, tú no tienes que crear ninguna, simplemente desde la base de clases negras, genera una extensión funcional de clases rojas usando tu creatividad.

*	No hace falta mencionar el color de las clases que se van a dar, puesto que eso los alumnos lo verán en el diagrama.

*	Devuélveme directamente el enunciado resultado como si fuera el del examen, sin comentarios entre medio ni indicaciones concretas generadas por ti.

*	Al no haber clases azules, no deberás decir ninguna información acerca de ellas en el enunciado generado, aunque en los enunciados de ejemplos si venga. 

