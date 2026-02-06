pipeline {
  agent any

  environment {
    APP_NAME = "book-guru"
    IMAGE_TAG = "1.0"
    IMAGE = "${APP_NAME}:${IMAGE_TAG}"
    DEPLOY_YAML = "k8s/deployment.yaml"
    SVC_YAML = "k8s/service.yaml"
  }

  stages {
    stage("Check tools") {
      steps {
        bat "docker version"
        bat "kubectl version --client"
        bat "minikube version"
      }
    }

    stage("Point Docker to Minikube") {
      steps {
        // Important: build image INTO minikube's docker so Kubernetes can pull it
        bat 'for /f "delims=" %%i in (\'minikube docker-env --shell cmd\') do %%i'
      }
    }

    stage("Build Docker image") {
      steps {
        bat "docker build -t %IMAGE% ."
        bat "docker images | findstr %APP_NAME%"
      }
    }

    stage("Deploy to Kubernetes") {
      steps {
        bat "kubectl apply -f %DEPLOY_YAML%"
        bat "kubectl apply -f %SVC_YAML%"
      }
    }

    stage("Verify rollout") {
      steps {
        bat "kubectl rollout status deployment/%APP_NAME% --timeout=120s"
        bat "kubectl get pods -o wide"
        bat "kubectl get svc"
      }
    }
  }
}
