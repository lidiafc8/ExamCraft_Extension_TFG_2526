# ESTRUCTURA BASE QUE DEBE SEGUIR ESTRICTAMENTE CADA CLASE

## Entidades (se deberán adaptar a los atributos concretos siguiendo el diagrama UML)

### Dominio Ajedrez

```java
package es.us.dp1.chess.tournament.round;

import java.time.LocalDate;
import java.util.List;

import es.us.dp1.chess.tournament.user.User;

import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Round {
    String name;
    Integer roundNumber;
    LocalDate roundDate;
    @Transient
    Tournament tournament;
    @Transient
    List<User> participants;
}
```

```java
package es.us.dp1.chess.tournament.tournament;


import java.time.LocalDate;
import java.util.List;

import es.us.dp1.chess.tournament.user.User;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.Transient;

@Getter
@Setter
public class Tournament {

    String name;

    Integer prize;

    LocalDate startDate;

    LocalDate endDate;

    @Transient
    List<User> participants;
}
```

```java
package es.us.dp1.chess.tournament.challenge;


import java.time.LocalDate;
import java.util.List;

import es.us.dp1.chess.tournament.match.ChessMatch;
import es.us.dp1.chess.tournament.user.User;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.Transient;

@Getter
@Setter
public class Challenge {

    String message;

    Integer targetValue;

    LocalDate startDate;

    LocalDate endDate;

    ChallengeObjective goal;

    @Transient
    List<User> participants;

    @Transient
    List<ChessMatch> matches;
}
```

### Dominio Clínica Veterinaria

```java
package org.springframework.samples.petclinic.symptom;

import java.util.Set;

import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Symptom {
    String virulence;

    @Transient
    Set<Disease> includes;

    @Transient
    Set<Disease> excludes;
}
```

```java
package org.springframework.samples.petclinic.treatment;

import java.util.Set;

import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Treatment {
    String description;
    Integer baseDose;
    Integer shockDose;
    Integer maxDose;

    @Transient
    Set<Disease> recommendedFor;
}
```

```java
package org.springframework.samples.petclinic.coupon;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Coupon {

    LocalDate startDate;

    LocalDate expiryDate;

    GroomingPackage groomingPackage;

}
```

```java
package org.springframework.samples.petclinic.groomingConsumed;

import java.util.List;

import org.springframework.samples.petclinic.visit.Visit;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class GroomingConsumed {

    String petBeautician;

    Integer minutes;

    String comment;

    Visit appliedDuring;

    Coupon consumed;

    List<GroomingType> typeConsumed;

}
```

```java
package org.springframework.samples.petclinic.medicine;

import java.time.LocalDate;
import java.util.Set;

import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Medicine{
    String description;
    Integer medication; // cantidad de medicación
    LocalDate startDate; // fecha de inicio de la medicación
    LocalDate endDate;  //fecha de fin de la medicación

    @Transient
    Set<Disease> prescribedfor;

}
```

```java
package org.springframework.samples.petclinic.symptom;

import java.util.Set;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Symptom {
    String description;

    @Transient
    Set<Disease> includedDiseases;

   @Transient
    Set<Disease> excludedDiseases;

}
```

```java
package org.springframework.samples.petclinic.coursePayment;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CoursePayment {
    LocalDate paidOn;
    Double amount;
}
```

```java
package org.springframework.samples.petclinic.courseAttendance;

import java.time.LocalDate;
import java.util.Set;

import org.springframework.samples.petclinic.vet.Vet;

import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseAttendance {
    LocalDate registeredOn;
    Integer grade;
    @Transient
    Set<CoursePayment> payments;
    @Transient
    Course course;
    @Transient
    Vet attendant;
}
```

## Enumerados (se deberán adaptar a los atributos concretos siguiendo el diagrama UML)

### Dominio Ajedrez

```java
package es.us.dp1.chess.tournament.challengeObjetive;

public enum ChallengeObjective {
    WIN_MATCHES, PLAY_MATCHES, ACQUIRE_PIECES
}
```

## Repositorios (para cada una de las entidades a crear)

### Dominio Ajedrez

```java
package es.us.dp1.chess.tournament.challenge;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ChallengeRepository {
    Optional<Challenge> findById(Integer id);
    List<Challenge> findAll();
    Challenge save(Challenge tournament);
```

```java
package es.us.dp1.chess.tournament.round;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface RoundRepository {
    Optional<Round> findById(Integer id);
    List<Round> findAll();
    //List<Round> findByTournament(Tournament tournament);
    Round save(Round round);
}
```

```java
package es.us.dp1.chess.tournament.tournament;

import java.util.List;
import java.util.Optional;

public interface TournamentRepository {
    Optional<Tournament> findById(Integer id);
    List<Tournament> findAll();
    Tournament save(Tournament tournament);
}
```

### Dominio Clínica Veterinaria

```java
package org.springframework.samples.petclinic.symptom;

import java.util.List;
import java.util.Optional;

public interface SymptomRepository {

    Optional<Symptom> findById(Integer i);

    List<Symptom> findAll();

    Symptom save(Symptom any);

}
```

```java
package org.springframework.samples.petclinic.treatment;

import java.util.List;
import java.util.Optional;

public interface TreatmentRepository {

    Optional<Treatment> findById(Integer i);

    List<Treatment> findAll();

    Treatment save(Treatment any);

}
```

```java
package org.springframework.samples.petclinic.allergy;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface AllergyRepository {

    Optional<Allergy> findById(Integer i);

    List<Allergy> findAll();

    Allergy save(Allergy any);

}
```

## Servicios (para cada una de las entidades a crear)

### Dominio Ajedrez

```java
package es.us.dp1.chess.tournament.challenge;

import java.util.List;

public class ChallengeService {
    ChallengeRepository challengeRepository;

    public ChallengeService(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }
```

```java
package es.us.dp1.chess.tournament.round;

import java.util.List;

public class RoundService {
    RoundRepository roundRepository;

    public RoundService(RoundRepository roundRepository) {
        this.roundRepository = roundRepository;
    }
```

```java
package es.us.dp1.chess.tournament.tournament;

import java.util.List;

public class TournamentService {
    TournamentRepository tournamentRepository;

    public TournamentService(TournamentRepository tournamentRepository) {
        this.tournamentRepository = tournamentRepository;
    }
```

### Dominio Clínica Veterinaria

```java
package org.springframework.samples.petclinic.symptom;

import java.util.List;

public class SymptomService {
    SymptomRepository repo;

    public SymptomService(SymptomRepository sr){
        this.repo=sr;
    }

    public List<Symptom> getAll() {
        return null;
    }

    public Symptom save(Symptom s) {
        return null;
    }
}
```

```java
package org.springframework.samples.petclinic.treatment;

import java.util.List;

public class TreatmentService {
    private TreatmentRepository repo;

    public TreatmentService(TreatmentRepository tr){
        this.repo=tr;
    }

    public List<Treatment> getAll() {
        return null;
    }

    public Treatment save(Treatment t) {
        return null;
    }
}
```

```java
package org.springframework.samples.petclinic.allergy;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AllergyService {
    AllergyRepository repo;


    public AllergyService(AllergyRepository sr){
        this.repo=sr;
    }

    public List<Allergy> getAll() {
        return repo.findAll();
    }

    public Allergy save(Allergy s) {
        return repo.save(s);
    }
}
```
