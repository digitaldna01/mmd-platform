plugins {
    java
    alias(libs.plugins.spring.boot)
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

dependencies {
    implementation(platform(libs.spring.boot.bom))
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.spring.boot.starter.webmvc)
    implementation(libs.springdoc.openapi.starter.webmvc.api)

    testImplementation(platform(libs.spring.boot.bom))
    testImplementation(libs.spring.boot.starter.webmvc.test)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}

tasks.test {
    inputs.files(rootProject.file("contracts/openapi/backend.json"))
}

tasks.register<Test>("updateOpenApi") {
    description = "코드에서 OpenAPI 스펙을 뽑아 contracts/openapi/backend.json을 갱신합니다."
    group = "documentation"
    testClassesDirs = sourceSets.test.get().output.classesDirs
    classpath = sourceSets.test.get().runtimeClasspath
    filter {
        includeTestsMatching("*OpenApiContractTest")
    }
    systemProperty("openapi.update", "true")
    outputs.upToDateWhen { false }
}
