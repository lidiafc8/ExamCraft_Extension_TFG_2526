# PROMPT PARA LA GENERACIÓN DE RELACIONES ENTRE ENTIDADES

## Recursos a proporcionar:
* `relationships_between_entities_examples_previous_exams.md`

## Prompt a utilizar:

Una vez que tenemos la extensión funcional completa del nuevo examen y el diagrama UML, pasaremos a generar el ejercicio “RELACIONES ENTRE ENTIDADES” del examen que estamos creando, es decir, la implementación de las relaciones entre las entidades correspondientes.

Quiero que en base a la lógica de la extensión funcional y el diagrama UML que me has pasado y que ya tenemos, recordando todo el contexto e información proporcionada previa, describirás en detalle las relaciones a implementar por el alumno entre las entidades descritas anteriormente, es decir, entre las clases rojas. Para ello, se te adjunta un archivo md llamado “relationships_between_entities_examples_previous_exams” con ejemplos de exámenes anteriores ya realizados.

Deberá cumplir estos requisitos:

-	Lo que vamos a proporcionar al alumno es un proyecto real que tendrá que manipular, por lo que los atributos de las nuevas clases tendrán anotaciones @Transient, que deberán eliminarse en este ejercicio. Esto se debe indicar explícitamente en este ejercicio.

-	Las explicaciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

-	Se debe especificar la direccionalidad de las relaciones a implementar y las entidades implicadas en cada una de ellas.

-	Se debe indicar que las relaciones deberán corresponderse con lo indicado en el diagrama UML proporcionado al alumno. 

-	Se debe indicar el nombre del atributo que identificará a la relación y la clase en la que tendrá que estar, en el caso en el que proceda.

-	Se debe indicar que deberá implementar correctamente la cardinalidad de la relación, poniendo ejemplos simples de la relación actual para que se entienda bien.

-	El enunciado deberá seguir la siguiente sintaxis:

    *“Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:”*

    *“Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n.”*
