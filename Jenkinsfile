pipeline {
  agent any

  environment {
    APP_NAME = "book-guru"
    IMAGE_TAG = "${BUILD_NUMBER}"
    IMAGE = "${APP_NAME}:${IMAGE_TAG}"
  }

  stages {
    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Install Dependencies") {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage("Run Tests") {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e
              npm run test:coverage
            '''
          } else {
            bat 'npm run test:coverage'
          }
        }
      }
    }

    stage("Build Docker Image") {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e
              docker build -t ${IMAGE} .
              docker tag ${IMAGE} ${APP_NAME}:latest
              docker images | grep ${APP_NAME}
            '''
          } else {
            bat '''
              docker build -t %IMAGE% .
              docker tag %IMAGE% %APP_NAME%:latest
              docker images | find "%APP_NAME%"
            '''
          }
        }
      }
    }

    stage("Run Container") {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e
              docker stop ${APP_NAME} || true
              docker rm ${APP_NAME} || true
              docker run -d --name ${APP_NAME} -p 30050:5050 ${IMAGE}
              sleep 5
              docker ps | grep ${APP_NAME}
            '''
          } else {
            bat '''
              docker stop %APP_NAME% >nul 2>&1 || exit /b 0
              docker rm %APP_NAME% >nul 2>&1 || exit /b 0
              docker run -d --name %APP_NAME% -p 30050:5050 %IMAGE%
              timeout /t 5
              docker ps | find "%APP_NAME%"
            '''
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (isUnix()) {
          sh 'docker ps -a | grep ${APP_NAME} || true'
        }
      }
    }
  }
}