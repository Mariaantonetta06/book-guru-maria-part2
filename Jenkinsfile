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
        sh 'npm ci'
      }
    }

    stage("Run Tests") {
      steps {
        sh '''
          set -e
          npm run test:coverage
        '''
      }
    }

    stage("Build Docker Image") {
      steps {
        sh '''
          set -e
          docker build -t ${IMAGE} .
          docker tag ${IMAGE} ${APP_NAME}:latest
          docker images | grep ${APP_NAME}
        '''
      }
    }

    stage("Deploy Container") {
      steps {
        sh '''
          set -e
          docker stop ${APP_NAME} || true
          docker rm ${APP_NAME} || true
          docker run -d --name ${APP_NAME} -p 30050:5050 ${IMAGE}
          sleep 3
          docker ps | grep ${APP_NAME}
        '''
      }
    }
  }

  post {
    always {
      sh 'docker ps -a | grep ${APP_NAME} || true'
    }
    success {
      sh 'echo "✅ BUILD SUCCESSFUL - App running on port 30050"'
    }
    failure {
      sh 'docker logs ${APP_NAME} || true'
    }
  }
}