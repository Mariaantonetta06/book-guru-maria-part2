pipeline {
  agent any

  environment {
    APP_NAME = "book-guru"
    IMAGE_TAG = "${BUILD_NUMBER}"
    IMAGE = "${APP_NAME}:${IMAGE_TAG}"
    REGISTRY = "docker.io"
    KUBECONFIG = "${WORKSPACE}/.kube/config"
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
            bat '''
              npm run test:coverage
            '''
          }
        }
      }
    }

    stage("Check Tools") {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e
              echo "Checking Docker..."
              docker version
              echo "Checking kubectl..."
              kubectl version --client
              echo "Checking Minikube..."
              minikube status || echo "Minikube not running, will start in next stage"
            '''
          } else {
            bat '''
              echo Checking Docker...
              docker version
              echo Checking kubectl...
              kubectl version --client
              echo Checking Minikube...
              minikube status || echo Minikube not running, will start in next stage
            '''
          }
        }
      }
    }

    stage("Start Minikube") {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e
              if ! minikube status | grep -q "Running"; then
                echo "Starting Minikube..."
                minikube start --driver=docker --force
              fi
              sleep 10
              eval $(minikube docker-env)
              kubectl config use-context minikube
              kubectl cluster-info
            '''
          } else {
            bat '''
              minikube status >nul 2>&1
              if errorlevel 1 (
                echo Starting Minikube...
                minikube start --force
              )
              timeout /t 10
              kubectl config use-context minikube
              kubectl cluster-info
            '''
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
              eval $(minikube docker-env)
              docker build -t ${IMAGE} .
              docker images | grep ${APP_NAME}
            '''
          } else {
            bat '''
              for /f "tokens=*" %%i in ('minikube docker-env --shell cmd') do %%i
              docker build -t %IMAGE% .
              docker images | find "%APP_NAME%"
            '''
          }
        }
      }
    }

    stage("Deploy to Kubernetes") {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e
              # Replace image tag in deployment.yaml
              sed -i "s|book-guru:1.0|${IMAGE}|g" deployment.yaml
              
              # Apply configurations
              kubectl apply -f deployment.yaml
              kubectl apply -f service.yaml
              
              # Wait for rollout
              kubectl rollout status deployment/${APP_NAME} --timeout=120s
              
              # Show status
              kubectl get pods -o wide
              kubectl get svc
            '''
          } else {
            bat '''
              REM Replace image tag in deployment.yaml
              powershell -Command "(Get-Content deployment.yaml) -replace 'book-guru:1.0', '%IMAGE%' | Set-Content deployment.yaml"
              
              REM Apply configurations
              kubectl apply -f deployment.yaml
              kubectl apply -f service.yaml
              
              REM Show status
              kubectl get pods -o wide
              kubectl get svc
            '''
          }
        }
      }
    }

    stage("Verify Deployment") {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e
              echo "Checking pod status..."
              kubectl get pods
              echo "Checking service..."
              kubectl get svc book-guru-service
              echo "Getting service URL..."
              minikube service book-guru-service --url
            '''
          } else {
            bat '''
              echo Checking pod status...
              kubectl get pods
              echo Checking service...
              kubectl get svc book-guru-service
            '''
          }
        }
      }
    }
  }

  post {
    always {
      echo "Build completed!"
      script {
        if (isUnix()) {
          sh 'kubectl get all || true'
        } else {
          bat 'kubectl get all || exit /b 0'
        }
      }
    }
    failure {
      echo "Build failed! Checking logs..."
      script {
        if (isUnix()) {
          sh '''
            echo "=== Pod Logs ==="
            kubectl logs -l app=book-guru --tail=50 || true
            echo "=== Pod Descriptions ==="
            kubectl describe pods -l app=book-guru || true
          '''
        }
      }
    }
  }
}