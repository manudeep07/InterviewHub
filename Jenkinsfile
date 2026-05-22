pipeline {

    agent any

    stages {

        stage('Pull Latest Docker Images') {
            steps {

                sh 'docker pull manudeep07/interviewhub-backend:latest'

                sh 'docker pull manudeep07/interviewhub-frontend:latest'
            }
        }

        stage('Deploy Application') {
            steps {

                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }

    }
}