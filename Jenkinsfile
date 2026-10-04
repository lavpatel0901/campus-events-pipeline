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

        stage('Code Quality') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        withSonarQubeEnv('SonarQube') {
                            bat "\"${scannerHome}\\bin\\sonar-scanner.bat\""
                        }
                    }
                }
            }
        }

        stage('Security') {
            steps {
                bat 'npm audit --audit-level=high'
                bat 'docker run --rm -v "%WORKSPACE%:/src" aquasec/trivy:latest fs --scanners vuln --severity HIGH,CRITICAL --exit-code 0 --skip-dirs node_modules --output /src/trivy-report.txt /src'
                bat 'type trivy-report.txt'
                archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker-compose -p campus-test -f docker-compose.test.yml up -d --build'
                retry(12) {
                    sleep 5
                    bat 'curl -f http://localhost:3001/health'
                }
            }
            post {
                failure {
                    bat 'docker-compose -p campus-test -f docker-compose.test.yml down'
                }
            }
        }

        stage('Release') {
            environment {
                PROD_SECRET = credentials('campus-prod-secret')
            }
            steps {
                bat 'docker tag %IMAGE_NAME%:%IMAGE_TAG% %IMAGE_NAME%:stable'
                bat '''
set "JWT_SECRET=%PROD_SECRET%"
set "DB_PASSWORD=%PROD_SECRET%"
set "ADMIN_PASSWORD=%PROD_SECRET%"
docker-compose -p campus-prod -f docker-compose.prod.yml up -d --build
'''
                retry(12) {
                    sleep 5
                    bat 'curl -f http://localhost:3000/health'
                }
            }
        }

        stage('Monitoring') {
            steps {
                retry(12) {
                    sleep 5
                    bat 'curl -f http://localhost:9090/-/ready'
                }
                bat 'curl -s http://localhost:9090/api/v1/rules'
            }
        }
    }

    post {
        success {
            echo "Pipeline finished. Version ${env.IMAGE_TAG} is deployed."
        }
        failure {
            echo 'Pipeline failed. Check the stage that turned red.'
        }
    }
}