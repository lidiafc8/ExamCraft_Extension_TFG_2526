# PROMPT COMPLETO PARA GENERACIÓN DE RELACIONES ENTRE ENTIDADES (EJERCICIO 2)

Una vez que tenemos la extensión funcional completa del nuevo examen, el diagrama UML y las restricciones de cada atributo, pasaremos a generar el **ejercicio 2** del examen que estamos creando.

Quiero que en base a la lógica de la extensión funcional, el diagrama UML y las restricciones que me has pasado y que ya tenemos, recordando todo el contexto e información proporcionada previa, describirás en detalle las relaciones a implementar por el alumno entre las entidades descritas anteriormente, es decir, entre las **clases rojas**.

**Recurso:** Para ello, se te adjunta un PDF llamado `“Ejercicios 2 de ejemplos exámenes anteriores”` con ejemplos de exámenes anteriores ya realizados.

### Requisitos:

* **Manejo de @Transient:** Lo que vamos a proporcionar al alumno es un proyecto real que tendrá que manipular, por lo que los atributos de las nuevas clases tendrán anotaciones `@Transient`, que deberán eliminarse en este ejercicio. **Esto se debe indicar explícitamente en este ejercicio.**
* **Estilo:** Las explicaciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo PDF.
* **Detalle:** Se debe especificar la **direccionalidad** de las relaciones a implementar y las **entidades implicadas** en cada una de ellas.
* **Consistencia:** Se debe indicar que las relaciones deberán corresponderse con lo indicado en el diagrama UML proporcionado al alumno.
* **Nombres:** Se debe indicar el nombre del atributo que identificará a la relación y la clase en la que tendrá que estar, en el caso en el que proceda.
* **Cardinalidad:** Se debe indicar que deberá implementar correctamente la cardinalidad de la relación, poniendo ejemplos simples de la relación actual para que se entienda bien.

### Sintaxis obligatoria del enunciado:

  “Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:”

  “Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n.”