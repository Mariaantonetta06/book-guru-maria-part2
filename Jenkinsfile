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

    stage("Deploy to Kubernetes") {
      steps {
        sh '''
          set -e
          
          # Check Minikube status
          echo "Checking Minikube status..."
          minikube status || minikube start --driver=docker --force
          
          # Load Docker environment
          echo "Loading Minikube Docker environment..."
          eval $(minikube docker-env)
          
          # Rebuild image in Minikube
          echo "Building image in Minikube..."
          docker build -t ${IMAGE} .
          docker tag ${IMAGE} ${APP_NAME}:latest
          
          # Set context to Minikube
          echo "Setting kubectl context to Minikube..."
          kubectl config use-context minikube
          
          # Apply deployment and service
          echo "Deploying to Kubernetes..."
          kubectl apply -f deployment.yaml
          kubectl apply -f service.yaml
          
          # Wait for deployment
          echo "Waiting for deployment to be ready..."
          sleep 5
          kubectl rollout status deployment/${APP_NAME} --timeout=60s || true
          
          # Show status
          echo "=== Pod Status ==="
          kubectl get pods -o wide
          echo "=== Service Status ==="
          kubectl get svc
          echo "=== All Resources ==="
          kubectl get all
        '''
      }
    }

    stage("Verify Deployment") {
      steps {
        sh '''
          set -e
          echo "=== Verification ==="
          echo "Pods:"
          kubectl get pods
          echo "Service:"
          kubectl get svc book-guru-service
          echo "=== Deployment Complete ==="
        '''
      }
    }
  }

  post {
    always {
      sh '''
        echo "=== Final Status ==="
        kubectl get all || true
        docker ps -a | grep ${APP_NAME} || true
      '''
    }
    success {
      sh '''
        echo "✅ BUILD SUCCESSFUL!"
        echo "App running on port 30050"
      '''
    }
    failure {
      sh '''
        echo "❌ BUILD FAILED"
        echo "=== Pod Logs ==="
        kubectl logs -l app=${APP_NAME} --tail=20 || true
        echo "=== Pod Descriptions ==="
        kubectl describe pods -l app=${APP_NAME} || true
      '''
    }
  }
}