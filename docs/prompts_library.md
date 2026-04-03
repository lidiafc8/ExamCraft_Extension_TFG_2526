# Biblioteca de Prompts — ExamCraft

Este documento recoge todos los prompts desarrollados para la extensión **ExamCraft**, organizados de forma clara para facilitar su uso, mantenimiento y mejora.


## ÍNDICE

1. [Generación de Enunciado de la Extensión Funcional](#prompt-1-)  
2. [Generación de Diagrama UML de la Extensión Funcional](#prompt-2-)  
3. [Generación de Ejercicio "Restricciones de Atributos"](#prompt-3-)  
4. [Generación de Ejercicio "Relaciones entre Entidades"](#prompt-4-)  
5. [Generación de Examen Completo](#prompt-5-)  
6. [Generación de Clases Base del Examen](#prompt-6-)  
7. [Generación de Tests del Examen](#prompt-7-)

## PROMPTS

### Prompt 1 📝

- **Título:**  Generación de Enunciado de la Extensión Funcional (*Generation of Functional Extension's Statement*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar un enunciado innovador y creativo, y así comenzar con la creación de la extensión funcional del examen de la asignatura *Diseño y Pruebas I* de la Universidad de Sevilla. Previamente se le aporta contexto de la asignatura, la estructura ya existente y usada por los profesores en dicho examen y los conocimientos a querer valorar en el alumno.

    Una extensión funcional es la información que recibe el alumno como contextualización del examen, donde se le presenta la nueva funcionalidad que se deberá añadir al proyecto base del que se parte (Clínica Veterinaria o Ajedrez), contando tanto con un enunciado (el texto) y un diagrama UML que explica a nivel técnico la funcionalidad introducida.

- **Recursos Necesarios:** Ejemplos de extensiones funcionales de exámenes anteriores.

- **Prompt:**  
    ```text
    # PROMPT COMPLETO PARA LA GENERACIÓN DE EXTENSIÓN FUNCIONAL (ENUNCIADO)

    ## Recursos a proporcionar:
    * `functional_extension_examples.md`

    ## Prompt a utilizar:

    Nuestra misión es generar un enunciado tomando el rol de profesores para una asignatura llamada Diseño y Pruebas para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Te voy a pasar enunciados de exámenes de otros años junto con el diagrama UML en código Mermaid que lo acompaña, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

    * Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
    * Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.
    * Respecto a los diagramas UML que te pasaré junto con los ejemplos:

        - Concepto de colores de clases:  

            - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación. 

            - **Clases azules**: La base proporcionada. Son clases ya implementadas con las que las clases rojas interactuarán. Pueden estar sujetas a modificaciones para integrar las nuevas funcionalidades.

            - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

            - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando. Las azules son clases que el profesorado al crear las nuevas extensiones necesitaba para que hubiese un sentido lógico en la funcionalidad y las rojas, pueden variar según la extensión funcional que se le añada.

        - Relaciones, cardinalidad y direccionalidad.
            - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

            - Relaciones rojas entre clases rojas y azules: el atributo de la relación ya viene dado, el alumno solo tendrá que poner la anotación de relación

            - Tendremos relaciones únicamente unidireccionales.

            - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    * Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo esto, y entendiéndolo a fondo, cogerás los enunciados de exámenes de ejemplo para usarlos como base en el archivo md llamado “functional_extension_examples” que te adjunto.

    Teniendo estos ejemplos, tu tarea es proporcionarme una extensión de enunciado nueva que sea funcional del proyecto {{DOMAIN}}, que cumpla estos requisitos:

    *	La extensión funcional deberá añadir alguna funcionalidad nueva respecto a los anteriores exámenes, es decir, los exámenes pasados como ejemplo.

    *	**Omite en tu respuesta el código Mermaid**, devuelve solo el enunciado en texto plano explicando la nueva extensión funcional.

    *	Omite en tu respuesta cualquier nota dirigida hacia el alumno y al profesorado.

    *	La extensión funcional devuelta deberá tener la misma estructura narrativa que la de los proporcionados como ejemplo, tanto el principio como el final del enunciado.

    *	La extensión funcional devuelta deberá tener el mismo nivel de detalle que los proporcionados como ejemplo, ni más ni menos, dando breves descripciones de los atributos de las nuevas entidades (rojas) y sus relaciones.

    *	La extensión funcional deberá mantener la base del dominio.

    *	Sé lo más creativo posible.

    *	Como te he explicado antes, las clases azules eran generadas por el profesorado como apoyo de la lógica nueva creada, por lo que tú evitarás crearlas. Simplemente desde la base de clases negras, genera una extensión funcional de clases rojas usando tu creatividad.

    *	En ningún caso mencionarás ni explicarás el color de las clases que se van a dar, puesto que eso los alumnos lo verán en el diagrama.

    *	Devuélveme directamente el enunciado resultado como si fuera el del examen, sin comentarios entre medio ni indicaciones concretas generadas por ti.

    *	Debido a la ausencia de clases azules, omite en tu respuesta cualquier información acerca de ellas en el enunciado generado, aunque en los enunciados de ejemplos si venga.
    
    ```


### Prompt 2 📝

- **Título:**  Generación de Diagrama UML de la Extensión Funcional (*Generation of Functional Extension's UML Diagram*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar correctamente el código en formato Mermaid del diagrama UML de la extensión funcional del examen. Entre dichas pautas se define el formato y el estilo de las entidades y del código a devolver, aportando contexto previamente del examen que queremos crear e indicando las partes que el alumno deberá implementar y cuáles no.

- **Recursos Necesarios:** Ejemplos de extensiones funcionales de exámenes anteriores.

- **Prompt:**  
    ```text
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
    
    ```

### Prompt 3 📝

- **Título:**  Generación de Ejercicio "Restricciones de Atributos" (*Generation of Attribute Constraints*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar correctamente las instrucciones del ejercicio "Restricciones de Atributos" del examen a crear, a partir de una extensión funcional (Enunciado y Diagrama UML) dada internamente como contexto. En este ejercicio se definen las diferentes restricciones que deberán tener los atributos de las entidades a implementar por el alumno.

- **Recursos Necesarios:** Ejemplos de restricciones de atributos de exámenes anteriores.

- **Prompt:**  
    ```text
    # PROMPT PARA LA GENERACIÓN DE RESTRICCIONES DE ATRIBUTOS A PARTIR DE UN ENUNCIADO CONCRETO

    ## Recursos a proporcionar:
    * `attribute_constraints_examples_previous_exams.md`

    ## Prompt a utilizar:

    Nuestra misión es generar, a partir de un enunciado dado, el ejercicio de un examen, tomando el rol de profesores para una asignatura llamada Diseño y Pruebas, para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Concretamente te pasaré el enunciado y el diagrama UML en código Mermaid que lo acompaña, elementos en los que te tendrás que basar para proporcionarme la solución, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

    -	Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.

    -	Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.

    -	Respecto al diagrama UML:

        -	Concepto de colores de clases: 

            - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación. 

            - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

            - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando y las rojas, pueden variar según la extensión funcional que se le añada.

        -	Relaciones, cardinalidad y direccionalidad:

            - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente.

            - Tendremos relaciones únicamente unidireccionales.

            - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    - Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo y entendiendo esto a fondo, basándote y siguiendo la lógica del enunciado y el diagrama UML en código Mermaid que te proporciono en la sección de contexto de este mensaje, quiero que me generes el ejercicio “RESTRICCIONES DE ATRIBUTOS” del examen, es decir, las restricciones a nivel de entidad de los atributos que componen las clases a implementar por el alumno, es decir, de las clases rojas. (not null, etc). Para ello, te adjunto el archivo md llamado “attribute_constraints_examples_previous_exams” como referencia. Deberá cumplir estos requisitos:

    -	ÚNICAMENTE generarás las restricciones a nivel de entidad de los atributos de las clases a implementar por el alumno.

    -	Las restricciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    -	Omitirás en tu respuesta cualquier mención y explicación sobre las restricciones de los atributos correspondientes a las relaciones entre las entidades, eso se definirá más adelante.

    -	Sé lo más creativo posible en cuanto a restricciones, ni muy simples, ni muy complejas.

    -	El enunciado deberá seguir la siguiente sintaxis:

        *“Modificar las clases [“clases a implementar nuevas (rojas)”] para que sean entidades. Estas deben tener los siguientes atributos y restricciones:*

        *Para la clase [clase a implementar nueva (roja)]:*
        *El atributo de tipo [tipo de atributo] llamado [nombre de atributo] actuará como [opcional/obligatorio], [restricciones explicadas en forma de texto]”*

    -	Al final del enunciado generado, añadirás este párrafo:

        *“No modifique por ahora las anotaciones @Transient de las clases. Modificar las interfaces [repositorios de entidades nuevas a implementar por el alumno (rojas), no siendo enumerados] alojada en el mismo paquete para que extienda a CrudRepository.”*
        
    ```

### Prompt 4 📝

- **Título:**  Generación de Ejercicio "Relaciones entre Entidades" (*Generation of Entity Relationships*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar correctamente las instrucciones del ejercicio "Relaciones entre Entidades" del examen a crear, a partir de una extensión funcional (Enunciado y Diagrama UML) dada internamente como contexto. En este ejercicio se definen las diferentes relaciones que deberán tener las entidades a implementar por el alumno.

- **Recursos Necesarios:** Ejemplos de relaciones entre entidades de exámenes anteriores.

- **Prompt:**  
    ```text
    # PROMPT COMPLETO PARA GENERACIÓN DE RELACIONES ENTRE ENTIDADES A PARTIR DE UN ENUNCIADO CONCRETO

    ## Recursos a proporcionar:
    * `relationships_between_entities_examples_previous_exams.md`

    ## Prompt a utilizar:

    Nuestra misión es generar, a partir de un enunciado dado, el ejercicio de un examen, tomando el rol de profesores para una asignatura llamada Diseño y Pruebas, para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Concretamente te pasaré el enunciado y el diagrama UML en código Mermaid que lo acompaña, elementos en los que te tendrás que basar para proporcionarme la solución, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

    -	Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
    -	Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.
    -	Respecto al diagrama UML:

        - 	Concepto de colores de clases:  
            - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación. 
            - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

            - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando y las rojas, pueden variar según la extensión funcional que se le añada.

        -	Relaciones, cardinalidad y direccionalidad:

            - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

            - Tendremos relaciones únicamente unidireccionales.

            - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    -	Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo y entendiendo esto a fondo, basándote y siguiendo la lógica del enunciado y el diagrama UML en código Mermaid que te proporciono en la sección de contexto de este mensaje, quiero que me generes el ejercicio “RELACIONES ENTRE ENTIDADES” del examen, es decir, describirás en detalle las relaciones a implementar por el alumno entre las distintas entidades, es decir, entre las clases rojas. Para ello, se te adjunta un archivo md llamado “relationships_between_entities_examples_previous_exams” con ejemplos de exámenes anteriores ya realizados.

    Deberá cumplir estos requisitos:

    -	Lo que vamos a proporcionar al alumno es un proyecto real que tendrá que manipular, por lo que los atributos de las nuevas clases tendrán anotaciones @Transient, que deberán eliminarse en este ejercicio. Esto se debe indicar explícitamente en este ejercicio.

    -	Las explicaciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    -	Se debe especificar la direccionalidad de las relaciones a implementar y las entidades implicadas en cada una de ellas.

    -	Se debe indicar que las relaciones deberán corresponderse con lo indicado en el diagrama UML proporcionado al alumno. 

    -	Se debe indicar el nombre del atributo que identificará a la relación y la clase en la que tendrá que estar, en el caso en el que proceda.

    -	Se debe indicar que deberá implementar correctamente la cardinalidad de la relación, poniendo ejemplos simples de la relación actual para que se entienda bien.

    -	Omite en tu respuesta cualquier anotación para los alumnos y criterios de evaluación, solo devuelve lo que se te especifica.

    -	El enunciado deberá seguir la siguiente sintaxis:

        *“Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:”*

        *“Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n.”*
     ```


### Prompt 5 📝

- **Título:**  Generación de Examen Completo (*Generation of Complete Exam*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar correcta y ordenadamente un examen completo, incluyendo en él tanto la extensión funcional, como las instrucciones para los ejercicios de "Restricciones de Atributos" y "Relaciones entre Entidades", consiguiendo así generar la descripción completa del examen de la asignatura de una vez con todas las partes a abordar en este proyecto.

- **Recursos Necesarios:** 
    - Ejemplos de extensiones funcionales de exámenes anteriores.
    - Ejemplos de restricciones de atributos de exámenes anteriores.
    - Ejemplos de relaciones entre entidades de exámenes anteriores.

- **Prompt:**  
    ```text
    # PROMPT COMPLETO PARA LA GENERACIÓN DE EXAMEN COMPLETO DISEÑO Y PRUEBAS I

    ## Recursos a proporcionar:
    * `functional_extension_examples.md`
    * `attribute_constraints_examples_previous_exams.md`
    * `relationships_between_entities_examples_previous_exams.md`

    ## Prompt a utilizar:

    Nuestra misión es generar un enunciado tomando el rol de profesores para una asignatura llamada Diseño y Pruebas para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Te voy a pasar enunciados de exámenes de otros años junto con el diagrama UML en código Mermaid que lo acompaña, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:
    
    * Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
    * Tenemos dos tipos de exámenes, uno enfocado a una **clínica veterinaria** y otro al **juego del ajedrez**.
    
    * Respecto a los diagramas UML que te pasaré junto con los ejemplos:

        - Concepto de colores de clases:
    
        - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación.  

        - **Clases azules**: La base proporcionada. Son clases ya implementadas con las que las clases rojas interactuarán. Pueden estar sujetas a modificaciones para integrar las nuevas funcionalidades. 

        - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

        - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando. Las azules son clases que el profesorado al crear las nuevas extensiones necesitaba para que hubiese un sentido lógico en la funcionalidad y las rojas, pueden variar según la extensión funcional que se le añada.

        - Relaciones, cardinalidad y direccionalidad:
        
        - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

        - Relaciones rojas entre clases rojas y azules: el atributo de la relación ya viene dado, el alumno solo tendrá que poner la anotación de relación

        -	Tendremos relaciones únicamente unidireccionales.

        -	La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    *	Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo esto, y entendiéndolo a fondo, cogerás los enunciados de exámenes de ejemplo para usarlos como base en el archivo md llamado “functional_extension_examples” que te adjunto.


    ### EXTENSIÓN FUNCIONAL

    Teniendo estos ejemplos, tu tarea es proporcionarme una extensión de enunciado nueva que sea funcional del proyecto **[ajedrez/clínica veterinaria]**, que cumpla estos requisitos:

    *	La extensión funcional deberá añadir alguna funcionalidad nueva respecto a los anteriores exámenes, es decir, los exámenes pasados como ejemplo.

    *	**Omite en tu respuesta el código Mermaid**, devuelve solo el enunciado en texto plano explicando la nueva extensión funcional.

    *	Omite en tu respuesta cualquier nota dirigida hacia el alumno y al profesorado.

    *	La extensión funcional devuelta deberá tener la misma estructura narrativa que la de los proporcionados como ejemplo, tanto el principio como el final del enunciado.

    *	La extensión funcional devuelta deberá tener el mismo nivel de detalle que los proporcionados como ejemplo, ni más ni menos, dando breves descripciones de los atributos de las nuevas entidades (rojas) y sus relaciones.

    *	La extensión funcional deberá mantener la base del dominio.

    *	Sé lo más creativo posible.

    *	Como te he explicado antes, las clases azules eran generadas por el profesorado como apoyo de la lógica nueva creada, por lo que tú evitarás crearlas. Simplemente desde la base de clases negras, genera una extensión funcional de clases rojas usando tu creatividad.

    *	En ningún caso mencionarás ni explicarás el color de las clases que se van a dar, puesto que eso los alumnos lo verán en el diagrama.

    *	Devuélveme directamente el enunciado resultado como si fuera el del examen, sin comentarios entre medio ni indicaciones concretas generadas por ti.

    *	Debido a la ausencia de clases azules, omite en tu respuesta cualquier información acerca de ellas en el enunciado generado, aunque en los enunciados de ejemplos si venga.

    ---
    Una vez que tenemos la extensión funcional completa del nuevo examen, pasaremos a la siguiente tarea que quiero que realices.

    Quiero que en base a la lógica de la extensión funcional que me has pasado, me generes un diagrama UML en código Mermaid similar al de los ejemplos que te he pasado en el documento “Extensiones funcionales de ejemplo”. Ten en cuenta estos requisitos:

    * Recuerda todo el contexto dado en la anterior petición.

    * De los enunciados de ejemplo, céntrate en los del tipo proyecto del que hemos creado la extensión. (ajedrez o clínica veterinaria)
    -	De ellos, mantendrás la estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), de las clases base, es decir, las de color negro.

    *	Para las nuevas clases a implementar por el alumno, es decir, clases rojas, añadirás toda su estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), acorde a la extensión funcional generada.

    *	Para las relaciones, si estas tienen un nombre asignado, este debe constar en el diagrama.

    *	El color del contenido de las clases negras debe ser negro también.

    *	El color del contenido de las clases rojas debe ser rojo también.


    ### RESTRICCIONES DE ATRIBUTOS

    Una vez creado el diagrama, generarás el enunciado para el ejercicio “RESTRICCIONES DE ATRIBUTOS” del examen, es decir, las restricciones a nivel de entidad de los atributos que componen las clases a implementar por el alumno, es decir, de las clases rojas. (not null, etc). Para ello, te adjunto el archivo md llamado “attribute_constraints_examples_previous_exams” como referencia. Deberá cumplir estos requisitos:

    *	ÚNICAMENTE generarás las restricciones a nivel de entidad de los atributos de las clases a implementar por el alumno.

    *	Las restricciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    *	Sé lo más creativo posible en cuanto a restricciones, ni muy simples, ni muy complejas.

    *	El enunciado deberá seguir la siguiente sintaxis:

        *“Modificar las clases [“clases a implementar nuevas (rojas)”] para que sean entidades. Estas deben tener los siguientes atributos y restricciones:*

        *Para la clase [clase a implementar nueva (roja)]:*
        *El atributo de tipo [tipo de atributo] llamado [nombre de atributo] actuará como [opcional/obligatorio], [restricciones explicadas en forma de texto]”*

    *	Al final del enunciado generado, añadirás este párrafo:

        *“No modifique por ahora las anotaciones @Transient de las clases. Modificar las interfaces [repositorios de entidades nuevas a implementar por el alumno (rojas), no siendo enumerados] alojada en el mismo paquete para que extienda a CrudRepository.”*

    ### RELACIONES ENTRE ENTIDADES

    Una vez que tenemos la extensión funcional completa del nuevo examen, el diagrama UML y las restricciones de cada atributo, pasaremos a generar el ejercicio “RELACIONES ENTRE ENTIDADES” del examen que estamos creando, es decir, la implementación de las relaciones entre las entidades correspondientes.

    Quiero que en base a la lógica de la extensión funcional, el diagrama UML y las restricciones que me has pasado y que ya tenemos, recordando todo el contexto e información proporcionada previa, describirás en detalle las relaciones a implementar por el alumno entre las entidades descritas anteriormente, es decir, entre las clases rojas. Para ello, se te adjunta un archivo md llamado “relationships_between_entities_examples_previous_exams” con ejemplos de exámenes anteriores ya realizados.

    Deberá cumplir estos requisitos:

    * Lo que vamos a proporcionar al alumno es un proyecto real que tendrá que manipular, por lo que los atributos de las nuevas clases tendrán anotaciones @Transient, que deberán eliminarse en este ejercicio. Esto se debe indicar explícitamente en este ejercicio.

    *	Las explicaciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    *	Se debe especificar la direccionalidad de las relaciones a implementar y las entidades implicadas en cada una de ellas.

    *	Se debe indicar que las relaciones deberán corresponderse con lo indicado en el diagrama UML proporcionado al alumno. 

    *	Se debe indicar el nombre del atributo que identificará a la relación y la clase en la que tendrá que estar, en el caso en el que proceda.

    *	Se debe indicar que deberá implementar correctamente la cardinalidad de la relación, poniendo ejemplos simples de la relación actual para que se entienda bien.

    *	El enunciado deberá seguir la siguiente sintaxis:

        *“Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:”*

        *“Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n.”*
     ```


### Prompt 6 📝

- **Título:**  Generación de Clases Base del Examen (*Generation of Exam Bases Classes*).

- **Descripción:** Establece las pautas y reglas que el modelo LLM debe seguir para generar de manera correcta y ordenada el código Java de cada una de las clases base que se proporcionarán al alumno. Este código se utilizará para subirlo automáticamente al repositorio del examen desde el cual el alumno comenzará a implementar los ejercicios, creando así todas las clases necesarias. Por lo tanto, la generación de este código es de vital importancia.

    Para ello, se proporciona al modelo la estructura específica que deben tener las entidades, servicios y repositorios correspondientes a las entidades que el alumno debe implementar o que no se encuentren ya en el repositorio plantilla del examen. Previamente, se entrega como contexto ejemplos de clases generadas en otros exámenes, a fin de guiar la correcta creación de las nuevas clases.

- **Recursos Necesarios:** 
    - Ejemplos de estructura de clases base de exámenes anteriores. 

- **Prompt:**  
    ```text
    # PROMPT PARA LA GENERACIÓN DE CLASES BASE A SUBIR AL REPOSITORIO EXAMEN

    Actúa como un desarrollador Senior de Java y Spring Boot experto en la creación de esqueletos de código para exámenes universitarios. 

    Tu tarea es analizar un diagrama UML y generar las clases base (Entidad, Repositorio y Servicio) únicamente para las entidades nuevas que el alumno debe desarrollar, siguiendo estrictamente una plantilla de estilo.

    ### DATOS DE ENTRADA
    - Dominio del proyecto: {dominio}
    - Clases que YA EXISTEN en el repositorio (NO debes generarlas bajo ninguna circunstancia): {clases_existentes}
    - Diagrama UML completo (formato Mermaid): {diagrama_uml}
    - Ejemplos de estructura base esperada (plantillas): {ejemplos_base}

    ### REGLAS DE GENERACIÓN (ESTRICTAS)
    1. IDENTIFICACIÓN: Compara las entidades del "Diagrama UML" con las "Clases que YA EXISTEN". Genera código ÚNICAMENTE para las entidades del UML que estén AUSENTES en la lista de clases existentes.
    2. ESTRUCTURA DE ARCHIVOS: Para cada entidad nueva identificada (ej. `Cita`), debes crear una carpeta con su nombre en minúsculas y dentro tres archivos:
    - La entidad en sí (ej. `Cita.java`)
    - El repositorio (ej. `CitaRepository.java`)
    - El servicio (ej. `CitaService.java`)
    3. FORMATO DE CÓDIGO: El código generado debe ser un esqueleto inicial para que el alumno lo complete. Debes imitar EXACTAMENTE la estructura, anotaciones JPA/Spring y nivel de detalle proporcionado en los "Ejemplos de estructura base esperada". EVITA añadir lógica de negocio adicional y resolver el examen.
    4. CERO EXPLICACIONES: Devuelve ÚNICAMENTE el código fuente. EVITA hacer saludos, explicaciones de tus decisiones y comentarios finales.

    ### FORMATO DE SALIDA OBLIGATORIO
    Para que el sistema automatizado pueda procesar tu respuesta, debes devolver cada archivo utilizando exactamente este formato (fíjate en la ruta de la carpeta):

    ### [nombrecarpeta]/[NombreClase].java
    ```java
    // Código Java aquí
    ```

### Prompt 7 📝

- **Título:**  Generación de Tests del Examen (*Generation of Exam Tests*).

- **Descripción:** Establece las pautas y reglas que el modelo LLM debe seguir para generar de manera correcta y ordenada el código Java de las clases de tests para el ejercicio de "Restricciones de atributos", encargadas de verificar automáticamente si el código implementado por el alumno, es decir, la respuesta al examen, es correcto.

    Dado que se parte de un examen plantilla, la estructura de dichos tests debe ser estrictamente precisa para garantizar el correcto funcionamiento del sistema de evaluación automática. Previamente, al modelo se le proporciona el contexto completo del examen, con el fin de orientar adecuadamente la generación de los tests.

- **Recursos Necesarios:** 
    - Ejemplos de tests de exámenes anteriores

- **Prompt:**  
    ```text
   # PROMPT COMPLETO PARA GENERACIÓN DE TESTS DE LOS DISTITNOS EJERCICIOS

    ## Recursos a proporcionar:
    * `generation_test.md`

    ## Prompt a utilizar:

    Nuestra misión es generar, a partir de un enunciado dado, el test del ejercicio de un examen, tomando el rol de profesores para una asignatura llamada Diseño y Pruebas, para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Concretamente te pasaré el enunciado y el diagrama UML en código Mermaid que lo acompaña, elementos en los que te tendrás que basar para proporcionarme la solución, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

    -	Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
    -	Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.
    -	Respecto al diagrama UML:

        - 	Concepto de colores de clases:  
            - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación. 
            - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

            - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando y las rojas, pueden variar según la extensión funcional que se le añada.

        -	Relaciones, cardinalidad y direccionalidad:

            - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

            - Tendremos relaciones únicamente unidireccionales.

            - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    -	Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo y entendiendo esto a fondo, basándote y siguiendo la lógica de los tests que te paso en el archivo md “generation_test”, donde vienen tests de ejemplos que se han realizado para otros enunciado de examenes, quiero que me generes los tests de los distintos ejercicios del examen.

    Deberá cumplir estos requisitos:

    -	Para generar los tests de los ejercicios es necesario usar lenguaje y framework: Java 17+, JUnit 5, Spring Boot (@DataJpaTest). 

    -	Los tests tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    -	La clase DEBE extender de la clase base ReflexiveTest proporcionada por la asignatura..


    ### Para el ejercicio Test1 :

    Requisitos que debe de cumplir:

    - Inyecta el Repositorio de la nueva entidad y el EntityManager usando @Autowired.
    - Crea el método test1RepositoriesExist(), anótalo con @Test y verifica que el repositorio siempre tiene que tener un valor, nunca null (assertNotNull).
    - Crea el método test1RepositoriesContainsMethod(). ESTRICTAMENTE PROHIBIDO anotarlo con @Test. Este método debe ser llamado internamente desde el final de test1RepositoriesExist() dentro de un bloque if (repositorio != null) para evitar un NullPointerException si la inyección falla.
    - Crea el método @Test public void test1Check[NOMBRE_ENTIDAD]Constraints().
    - Analiza el UML proporcionado. Identifica los campos obligatorios e invoca el método heredado checkThatFieldsAreMandatory(entidad, em, "campo1", "campo2", ...).
    - Analiza las restricciones del UML (tamaños, mínimos, máximos, nulos). Construye un mapa con los casos negativos (valores frontera y particiones de equivalencia).
    - ESTRICTAMENTE PROHIBIDO usar new HashMap<>() o .put(). Inicializa el mapa en una sola instrucción con Java moderno: Map<String, List<Object>> invalidValues = Map.of("campo1", List.of(...), "campo2", List.of(...));.
    - Invoca el método heredado checkThatValuesAreNotValid(entidad, invalidValues, em).
    - Crea el método @Test public void test1Check[NOMBRE_ENTIDAD]Annotations().
    - Usa el método heredado classIsAnnotatedWith(Clase.class, Entity.class) para verificar @Entity.
    - Si la entidad tiene algún atributo Enum, usa reflexión para verificar que tiene la anotación @Enumerated(EnumType.STRING).
    - Crea un método public static [Entidad] createValid[NOMBRE_ENTIDAD](EntityManager em).
    - Usa EXCLUSIVAMENTE el método heredado setValue(entidad, "atributo", Tipo.class, valor) para asignar datos válidos a todos los atributos de la entidad, evadiendo así fallos de compilación si el alumno se le ha olvidado crear los setters.
    - Crea el método @Test public void test1Valid[NOMBRE_ENTIDAD]IsPersisted(). Obtén una instancia válida, guárdala con el repositorio y haz un .flush() dentro de un assertDoesNotThrow.

    Por favor, bajo ninguna circustnacia generes nada de comentarios, solo los tests para copiar lo que me devuelvas directamente para ejecutarlo.

    Tampoco pongas nada de ```java y ``` 

    Genera el código completo de Test1.java aplicando estas reglas a la entidad principal descrita en el UML de este examen en particular.
    ```