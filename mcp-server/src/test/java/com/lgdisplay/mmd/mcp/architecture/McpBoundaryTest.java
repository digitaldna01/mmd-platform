package com.lgdisplay.mmd.mcp.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.lgdisplay.mmd.mcp.audit.ToolAudit;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class McpBoundaryTest {

    private static final JavaClasses CLASSES = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("com.lgdisplay.mmd.mcp");

    @Test
    void everyToolClassGoesThroughAudit() {
        classes().that().resideInAPackage("..mcp.tool..").and().areTopLevelClasses()
                .should().dependOnClassesThat().areAssignableTo(ToolAudit.class)
                .check(CLASSES);
    }

    @Test
    void doesNotAccessDatabase() {
        noClasses().should().dependOnClassesThat()
                .resideInAnyPackage("java.sql..", "javax.sql..", "org.apache.ibatis..", "org.mybatis..")
                .check(CLASSES);
    }

    @Test
    void doesNotReferenceBackendCode() {
        noClasses().should().dependOnClassesThat().resideInAPackage("com.lgdisplay.mmd.backend..")
                .check(CLASSES);
    }

    @Test
    void callsBackendOnlyThroughGeneratedClient() {
        noClasses().that().resideOutsideOfPackages("com.lgdisplay.mmd.mcp.backend..", "com.lgdisplay.mmd.mcp.config..")
                .should().dependOnClassesThat()
                .resideInAnyPackage("org.springframework.web.client..", "java.net.http..")
                .check(CLASSES);
    }
}
