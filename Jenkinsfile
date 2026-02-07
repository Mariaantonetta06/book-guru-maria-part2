pipeline {
  agent any

  environment {
    APP_NAME    = "book-guru"
    IMAGE_TAG   = "1.0"
    IMAGE       = "${APP_NAME}:${IMAGE_TAG}"
    DEPLOY_YAML = "k8s/deployment.yaml"
    SVC_YAML    = "k8s/service.yaml"
    KUBECONFIG  = "/var/jenkins_home/.kube/config"
  }

  stages {
    stage("Check tools") {
      steps {
        sh 'docker version'
        sh 'kubectl version --client'
        sh 'kubectl config use-context minikube'
        sh 'kubectl cluster-info'
      }
    }

    stage("Build Docker image") {
      steps {
        sh "docker build -t ${IMAGE} ."
        sh "docker images | grep ${APP_NAME} || true"
      }
    }

    stage("Deploy to Kubernetes") {
      steps {
        sh "kubectl apply -f ${DEPLOY_YAML}"
        sh "kubectl apply -f ${SVC_YAML}"
      }
    }

    stage("Verify rollout") {
      steps {
        sh "kubectl rollout status deployment/${APP_NAME} --timeout=120s"
        sh "kubectl get pods -o wide"
        sh "kubectl get svc"
      }
    }
  }
}
