package com.lgdisplay.mmd.backend.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class MessagingBoundaryTest {

    private static final JavaClasses CLASSES = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("com.lgdisplay.mmd.backend");

    @Test
    void onlyTibrvAdapterUsesTibrvClasses() {
        noClasses().that().resideOutsideOfPackage("..messaging.adapter.tibrv..")
                .should().dependOnClassesThat().resideInAPackage("com.tibco..")
                .check(CLASSES);
    }

    @Test
    void onlyKafkaAdapterUsesKafkaClasses() {
        noClasses().that().resideOutsideOfPackage("..messaging.adapter.kafka..")
                .should().dependOnClassesThat().resideInAnyPackage("org.apache.kafka..", "org.springframework.kafka..")
                .check(CLASSES);
    }

    @Test
    void businessCodeDoesNotUseTransportDirectly() {
        noClasses().that().resideOutsideOfPackage("..messaging..")
                .should().dependOnClassesThat().resideInAnyPackage("..messaging.port..", "..messaging.adapter..")
                .check(CLASSES);
    }

    @Test
    void gatewayDoesNotKnowAdapters() {
        noClasses().that().resideInAPackage("..messaging.gateway..")
                .should().dependOnClassesThat().resideInAPackage("..messaging.adapter..")
                .check(CLASSES);
    }
}
