# PROMPT PARA LA GENERACIÓN DE EXTENSIÓN FUNCIONAL (DIAGRAMA UML) - ENTIDADES, ATRIBUTOS, RELACIONES

## Recursos a proporcionar:
* `functional_extension_examples.md`

## Prompt a utilizar:

Una vez que tenemos la extensión funcional completa del nuevo examen, pasaremos a la siguiente tarea que quiero que realices.

Quiero que en base a la lógica de la extensión funcional que me has pasado, me generes un diagrama UML en código Mermaid similar al de los ejemplos que te he pasado en el documento md “functional_extension_examples”. Ten en cuenta estos requisitos:

-	Recuerda todo el contexto dado en la anterior petición.

-	De los enunciados de ejemplo, céntrate en la estructura del código Mermaid de los del proyecto {{DOMAIN}}

     - De ellos, mantendrás la estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), de las clases base, es decir, las de color negro.

-	Para las nuevas clases a implementar por el alumno, es decir, clases rojas, añadirás toda su estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), acorde a la extensión funcional generada.

-	Para las relaciones, si estas tienen un nombre asignado, este debe constar en el diagrama.

-    REGLA ESTRICTA DE FORMATO: Genera código Mermaid válido y estándar. Bajo ninguna circunstancia utilices comandos de estilo (como style, classDef o linkStyle). Limítate exclusivamente a definir las clases, sus atributos, métodos y las relaciones entre ellas. Separa cada instrucción con un salto de línea.
