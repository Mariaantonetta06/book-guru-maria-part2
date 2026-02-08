pipeline {
  agent any

  environment {
    APP_NAME   = "book-guru"
    IMAGE_TAG  = "1.0"
    IMAGE      = "${APP_NAME}:${IMAGE_TAG}"
    KUBECONFIG = "/var/jenkins_home/.kube/config"
  }

  stages {

    stage("Checkout") {
      steps { checkout scm }
    }

    stage("Install + Test") {
      steps {
        sh '''
          set -e
          node --version
          npm --version
          npm ci
          npm run test:coverage
        '''
      }
    }

    stage("Check Tools + Cluster") {
      steps {
        sh '''
          set -e
          docker version
          kubectl version --client

          # Make sure we are using minikube context
          kubectl config use-context minikube

          # Confirm cluster reachable (this will FAIL if jenkins container is not on minikube network)
          kubectl get nodes
        '''
      }
    }

    stage("Build Docker Image") {
      steps {
        sh '''
          set -e
          docker build -t ${IMAGE} .
          docker images | grep ${APP_NAME}
        '''
      }
    }

    stage("Load Image into Minikube Node") {
      steps {
        sh '''
          set -e

          # Save locally on Jenkins container (Docker CLI talks to host daemon via mounted socket)
          rm -f /tmp/${APP_NAME}.tar
          docker save ${IMAGE} -o /tmp/${APP_NAME}.tar

          # Copy into the minikube node container and import into container runtime
          docker cp /tmp/${APP_NAME}.tar minikube:/tmp/${APP_NAME}.tar

          # Try crictl first, fallback to ctr
          docker exec minikube sh -lc 'if command -v crictl >/dev/null 2>&1; then crictl images >/dev/null 2>&1 || true; crictl load /tmp/${APP_NAME}.tar; \
            elif command -v ctr >/dev/null 2>&1; then ctr -n k8s.io images import /tmp/${APP_NAME}.tar; \
            else echo "ERROR: no crictl/ctr found inside minikube node"; exit 1; fi'

          echo "Image loaded into minikube node."
        '''
      }
    }

    stage("Deploy to Kubernetes") {
      steps {
        sh '''
          set -e

          # Support either k8s/deployment.yaml OR deployment.yaml
          if [ -f k8s/deployment.yaml ]; then DEPLOY_YAML="k8s/deployment.yaml"; else DEPLOY_YAML="deployment.yaml"; fi
          if [ -f k8s/service.yaml ]; then SVC_YAML="k8s/service.yaml"; else SVC_YAML="service.yaml"; fi

          echo "Using DEPLOY_YAML=$DEPLOY_YAML"
          echo "Using SVC_YAML=$SVC_YAML"

          kubectl apply -f "$DEPLOY_YAML"
          kubectl apply -f "$SVC_YAML"
        '''
      }
    }

    stage("Verify Rollout") {
      steps {
        sh '''
          set -e
          kubectl rollout status deployment/${APP_NAME} --timeout=180s
          kubectl get pods -o wide
          kubectl get svc
        '''
      }
    }
  }

  post {
    failure {
      sh '''
        echo "=== DEBUG: pods ==="
        kubectl get pods -o wide || true
        echo "=== DEBUG: describe ==="
        kubectl describe pods -l app=${APP_NAME} || true
        echo "=== DEBUG: logs ==="
        kubectl logs -l app=${APP_NAME} --tail=80 || true
      '''
    }
  }
}
