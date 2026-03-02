# PROMPT PARA LA GENERACIÓN DE RESTRICCIONES DE ATRIBUTOS

## Recursos a proporcionar:
* `attribute_constraints_examples_previous_exams.md`

## Prompt a utilizar:

Una vez creado el diagrama, generarás el enunciado para el ejercicio “RESTRICCIONES DE ATRIBUTOS” del examen, es decir, las restricciones a nivel de entidad de los atributos que componen las clases a implementar por el alumno, es decir, de las clases rojas. (not null, etc). Para ello, te adjunto el archivo md llamado “attribute_constraints_examples_previous_exams” como referencia. Deberá cumplir estos requisitos:

-	ÚNICAMENTE generarás las restricciones a nivel de entidad de los atributos de las clases a implementar por el alumno.

-	Las restricciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

-	Sé lo más creativo posible en cuanto a restricciones, ni muy simples, ni muy complejas.

-	El enunciado deberá seguir la siguiente sintaxis:

     *“Modificar las clases [“clases a implementar nuevas (rojas)”] para que sean entidades. Estas deben tener los siguientes atributos y restricciones:*

     *Para la clase [clase a implementar nueva (roja)]:*
     *El atributo de tipo [tipo de atributo] llamado [nombre de atributo] actuará como [opcional/obligatorio], [restricciones explicadas en forma de texto]”*

-	Al final del enunciado generado, añadirás este párrafo:

     *“No modifique por ahora las anotaciones @Transient de las clases. Modificar las interfaces [repositorios de entidades nuevas a implementar por el alumno (rojas), no siendo enumerados] alojada en el mismo paquete para que extienda a CrudRepository.”*
