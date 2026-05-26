# RELACIONES ENTRE ENTIDADES DE EJEMPLO EXÁMENES ANTERIORES

## Clínica Veterinaria:

### ControlCheck 1 G1 ----------------------------------------------------------------------------------------------------------------------

```
Elimine las anotaciones @Transient de los métodos y atributos que las
tengan en las entidades creadas anteriormente, así como la del atributo
symptoms de la clase Visit. Se pide crear las siguientes relaciones entre las
entidades. Cree una relación unidireccional desde “Visit” hacia “Symptom”
que exprese la que aparece en el diagrama UML (mostrado en la primera
página de este enunciado) respetando sus cardinalidades, usando el atributo
“symptoms” de la clase “Visit”.

Además, se pide crear una relación unidireccional desde “Symptom” hacia
“Disease” que represente la que aparece en el diagrama UML, tenga en
cuenta la cardinalidad que tiene, usando el atributo “includes” en la clase
“Symptom”. Debe asegurarse de que las relaciones expresan adecuadamente
la cardinalidad que muestra el diagrama UML, por ejemplo, algunos
atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no,
porque su cardinalidad en el extremo navegable de la relación es 1..n.

Finalmente, se pide crear una relación unidireccional desde “Treatment“
hacia “Disease” que represente la que aparece en el diagrama, usando como
nombre de atributo recommendedFor. Debe asegurarse de que las relaciones
expresan adecuadamente la cardinalidad que muestra el diagrama UML, por
ejemplo, el atributo no puede ser nulo y es obligatorio, puesto que la
cardinalidad es 1..n en el extremo de Disease.
```

### ControlCheck 1 G2 ----------------------------------------------------------------------------------------------------------------------

```
Se pide crear las siguientes relaciones entre las entidades:

▪ Una relación unidireccional desde “Surgery” hacia “Pet” que
exprese la que aparece en el diagrama UML (mostrado en la
primera página de este enunciado) respetando sus cardinalidades,
usando el atributo “pet”.

▪ Una relación unidireccional desde “Surgery” hacia
“SurgeryType” que represente la que aparece en el diagrama
UML respetando sus cardinalidades, usando el atributo “type”.

▪ Una relación unidireccional desde “OperatingRoom” hacia
“SurgeryType” que represente la que aparece en el diagrama
UML respetando sus cardinalidades, usando el atributo
“validFor”.

▪ Una relación unidireccional desde “Surgery” hacia
“OperatingRoom” que exprese la que aparece en el diagrama
UML respetando sus cardinalidades, usando el atributo “room”
de la clase “Surgery”.
```

### ControlCheck 1 G3 ----------------------------------------------------------------------------------------------------------------------

```
Elimine las anotaciones @Transient de los métodos y atributos que las
tengan en las entidades creadas anteriormente, así como la del atributo
attendants de la clase Course. Se pide crear las siguientes relaciones entre las
entidades:

Una relación bidireccional entre “CourseAttendance” y “Course” que
represente la que aparece en el diagrama UML, teniendo en cuenta la
cardinalidad que tiene.

Además, cree dos relaciones unidireccionales desde “CourseAttendance”
hacia “Vet” y hacia “CoursePayment” que expresen las que aparecen en el
diagrama UML (mostrado en la primera página de este enunciado), usando
los atributos “attendant” y “payments” de la clase “CourseAttendance”,
correspondientemente. Debe asegurarse de que las relaciones expresan
adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo,
algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero
otros no, porque su cardinalidad en el extremo navegable de la relación es 1.
```

### ControlCheck 2 G1 ----------------------------------------------------------------------------------------------------------------------

```
Elimine las anotaciones @Transient de los métodos y atributos que las
tengan en las entidades creadas en el ejercicio anterior, así como la del
atributo symptoms de la clase Visit. Se pide crear las siguientes relaciones
entre las entidades:

Cree una relación unidireccional desde “Visit” hacia “Symptom” que exprese
la que aparece en el diagrama UML (mostrado en la primera página de este
enunciado) respetando sus cardinalidades, usando el atributo “symptoms” de
la clase “Visit”.

Además, se pide crear dos relaciones unidireccionales desde “Symptom”
hacia “Disease” que representen las que aparecen en el diagrama UML,
tenga en cuenta la cardinalidad que tienen (recuerde que en este caso, al
tratarse de una doble relación n a n entre las mismas entidades se trata de
unas relaciones bastante exóticas), usando como nombre de los atributos
“includedDiseases” y “excludedDiseases” en la clase “Symptom”.

Finalmente, se pide crear una relación unidireccional desde “Medicine”
hacia “Disease” que represente la que aparece en el diagrama. Debe
asegurarse de que las relaciones expresan adecuadamente la cardinalidad que
muestra el diagrama UML.
```

### ControlCheck 2 G2 ----------------------------------------------------------------------------------------------------------------------

```
Además, se pide crear las siguientes relaciones entre las entidades.

▪ Cree tres relaciones unidireccionales desde
“GroomingConsumed” hacia “Visit” utilizando el atributo
“appliedDuring”, de “GroomingConsumed” hacia
“GroomingType” utilizando el atributo “typeConsumed” y de
“GroomingConsumed” hacia “Coupon” utilizando el atributo
“consumed”, que expresen las relaciones que aparecen en el
diagrama UML (mostrado en la primera página de este
enunciado) respetando sus cardinalidades.

▪ Cree una relación unidireccional desde “Coupon” hacia
“GromingPackage” que represente la que aparece en el diagrama
UML, teniendo en cuenta la cardinalidad y usando el atributo
“groomingPackage” en la clase “Coupon”

Debe asegurarse de que las relaciones expresan adecuadamente la
cardinalidad que muestra el diagrama UML, por ejemplo, el atributo
groomingPackage no puede ser nulo puesto que la cardinalidad es 1.
```

### ControlCheck 2 G3 ----------------------------------------------------------------------------------------------------------------------

```
Elimine las anotaciones @Transient de los métodos y atributos que las
tengan en las entidades creadas en el ejercicio anterior, así como del atributo
allergies de la clase Pet. Se pide crear las siguientes relaciones entre las
entidades:

Cree una relación unidireccional desde “Prescription” hacia “Visit” que
exprese la que aparece en el diagrama UML (mostrado en la primera página
de este enunciado) respetando sus cardinalidades, usando un atributo “visit”
en la clase “Prescription”.

Cree dos relaciones unidireccionales desde “Prescription” hacia
“Medication” que representen las que aparecen en el diagrama UML, es
decir la medicación prescrita tanto obligatoria como opcional. Tenga en
cuenta la cardinalidad que tienen (recuerde que en este caso, al tratarse de
una doble relación n a n entre las mismas entidades se trata de unas
relaciones bastante exóticas vistas en teoría), usando como nombre de los
atributos “mandatoryMedications” y “optionalMedications” en la clase
“Prescription”. Debe asegurarse de que las relaciones expresan
adecuadamente la cardinalidad que muestra el diagrama UML.

Finalmente, se piden crear dos relaciones para la clase Allergy. Una de ellas
unidireccional desde “Pet” hacia “Allergy”; y otra desde “Allergy” hacia
“ActivePrinciple” que representen las que aparecen en el diagrama. Debe
asegurarse de que las relaciones expresan adecuadamente la cardinalidad que
muestra el diagrama UML.
```

### 3º Convocatoria (octubre)----------------------------------------------------------------------------------------------------------------------

```
Elimine las anotaciones @Transient de los métodos y atributos que las
tengan en las entidades creadas en el ejercicio anterior, así como la del
atributo symptoms de la clase Visit. Se pide crear las siguientes relaciones
entre las entidades. Cree una relación unidireccional desde “Visit” hacia
“Symptom” que exprese la que aparece en el diagrama UML (mostrado en la
primera página de este enunciado) respetando sus cardinalidades, usando el
atributo “symptoms” de la clase “Visit”.

Además, se pide crear dos relaciones unidireccionales desde “Symptom”
hacia “Disease” que representen las que aparecen en el diagrama UML,
tenga en cuenta la cardinalidad que tienen (recuerde que en este caso, al
tratarse de una doble relación n a n entre las mismas entidades se trata de
unas relaciones bastante exóticas), usando como nombre de los atributos
“includes ” y “excludes” en la clase “Symptom”. Debe asegurarse de que las
relaciones expresan adecuadamente la cardinalidad que muestra el diagrama
UML, por ejemplo, algunos atributos pueden ser nulos puesto que la
cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo
navegable de la relación es 1..n.

Finalmente, se pide crear una relación unidireccional desde “Treatment“
hacia “Disease” que represente la que aparece en el diagrama, usando como
nombre de atributo recommendedFor. Debe asegurarse de que las relaciones
expresan adecuadamente la cardinalidad que muestra el diagrama UML, por
ejemplo, el atributo no puede ser nulo y es obligatorio, puesto que la
cardinalidad es 1..n en el extremo de Disease.
```

## Juego de Ajedrez:

### 1ª Convocatoria (enero) ----------------------------------------------------------------------------------------------------------------

```
Elimine las anotaciones @Transient de los métodos y atributos que las
tengan en las entidades creadas en el ejercicio anterior. Se pide crear las
siguientes relaciones entre las entidades:

Cree una relación unidireccional desde “Round” hacia “Tournament” que
exprese la que aparece en el diagrama UML (mostrado en la primera página
de este enunciado) respetando sus cardinalidades, usando el atributo
“tournament” de la clase “Round”.

Además, se pide crear dos relaciones unidireccionales desde “Tournament” y
“Round” hacia “User” que representen las que aparecen en el diagrama
UML, tenga en cuenta la cardinalidad que tienen, usando como nombre de
los atributos “participants”. Debe asegurarse de que las relaciones expresan
adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo,
algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero
otros no, porque su cardinalidad en el extremo navegable de la relación es
1..n.

Finalmente, se pide crear una relación unidireccional desde “ChessMatch“
hacia “Round” que represente la que aparece en el diagrama, usando como
nombre de atributo “round” en la clase “ChessMatch”. Debe asegurarse de
que las relaciones expresan adecuadamente la cardinalidad que muestra el
diagrama UML, por ejemplo, en este caso el atributo si podría ser nulo,
puesto que la cardinalidad es “0..1” en el extremo de “Round”, pero si fuera
“1” o “1..n” sería obligatorio.
```

### 2ª Convocatoria (julio) ----------------------------------------------------------------------------------------------------------------

```
Elimine las anotaciones @Transient de los métodos y atributos que las
tengan en las entidades creadas en el ejercicio anterior. Se pide crear las
siguientes relaciones entre las entidades:

Cree una relación unidireccional desde “Challenge” hacia “User” que
exprese la que aparece en el diagrama UML (mostrado en la primera página
de este enunciado) respetando sus cardinalidades, usando el atributo
“participants” de la clase “Challenge”.

Además, se pide crear otra relación unidireccional desde “Challenge” hacia
“ChessMatch” mediante el atributo “matches” que representen la que
aparece en el diagrama UML, tenga en cuenta la cardinalidad que tiene.
Debe asegurarse de que las relaciones expresan adecuadamente la
cardinalidad que muestra el diagrama UML, por ejemplo, en el diagrama,
algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero
otros no, porque su cardinalidad en el extremo navegable de la relación es
1..n.
```
