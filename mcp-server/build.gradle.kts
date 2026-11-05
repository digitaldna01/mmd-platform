plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.openapi.generator)
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

springBoot {
    buildInfo {
        excludes = setOf("time")
    }
}

val backendClientDir = layout.buildDirectory.dir("generated/backend-client")

openApiGenerate {
    generatorName = "java"
    library = "restclient"
    inputSpec = rootProject.file("contracts/openapi/backend.json")
    outputDir = backendClientDir
    apiPackage = "com.lgdisplay.mmd.mcp.backend.api"
    modelPackage = "com.lgdisplay.mmd.mcp.backend.model"
    invokerPackage = "com.lgdisplay.mmd.mcp.backend.client"
    generateApiTests = false
    generateModelTests = false
    generateApiDocumentation = false
    generateModelDocumentation = false
    configOptions = mapOf(
        "useSpringBoot4" to "true",
        "useJackson3" to "true",
        "openApiNullable" to "false",
        "hideGenerationTimestamp" to "true",
    )
}

sourceSets {
    main {
        java.srcDir(backendClientDir.map { it.dir("src/main/java") })
    }
}

tasks.compileJava {
    dependsOn(tasks.openApiGenerate)
}

dependencies {
    implementation(platform(libs.spring.boot.bom))
    implementation(platform(libs.spring.ai.bom))
    implementation(libs.spring.ai.starter.mcp.server.webmvc)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.spring.boot.starter.restclient)

    testImplementation(platform(libs.spring.boot.bom))
    testImplementation(libs.spring.boot.starter.webmvc.test)
    testImplementation(libs.archunit)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.test {
    useJUnitPlatform()
}
