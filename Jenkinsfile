pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_NAME = 'campus-events'
        JEST_JUNIT_OUTPUT_DIR = 'reports'
        PATH = "C:\\Users\\DELL\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;${env.PATH}"
    }

    stages {
        stage('Build') {
            steps {
                script {
                    env.GIT_SHORT = bat(returnStdout: true, script: '@git rev-parse --short HEAD').trim()
                    env.IMAGE_TAG = "1.0.${env.BUILD_NUMBER}"
                }
                bat 'npm ci'
                bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest --label git.commit=%GIT_SHORT% .'
                bat 'echo version=%IMAGE_TAG% commit=%GIT_SHORT% build=%BUILD_NUMBER% > build-info.txt'
                archiveArtifacts artifacts: 'build-info.txt', fingerprint: true
            }
        }

        stage('Test') {
            steps {
                bat 'npx jest --ci --coverage --reporters=default --reporters=jest-junit'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                    archiveArtifacts artifacts: 'coverage/lcov.info', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline finished. Image ${env.IMAGE_NAME}:${env.IMAGE_TAG} is ready."
        }
        failure {
            echo 'Pipeline failed. Check the stage that turned red.'
        }
    }
}