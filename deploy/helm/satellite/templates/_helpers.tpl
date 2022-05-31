{{/*
Expand the name of the chart.
*/}}
{{- define "satellite.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "satellite.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "satellite.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "satellite.labels" -}}
helm.sh/chart: {{ include "satellite.chart" . }}
{{ include "satellite.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "satellite.selectorLabels" -}}
app.kubernetes.io/name: {{ include "satellite.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "satellite.serviceAccountName" -}}
{{- if .Values.serviceAccount.enabled -}}
    {{ default (include "satellite.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the cluster role and cluster role binding to use
*/}}
{{- define "satellite.rbacName" -}}
{{- if .Values.rbac.enabled -}}
    {{ default (include "satellite.fullname" .) .Values.rbac.name }}
{{- else -}}
    {{ default "default" .Values.rbac.name }}
{{- end -}}
{{- end -}}

{{/*
Additional annotations for Pods
*/}}
{{- define "satellite.podAnnotations" -}}
{{- if .Values.podAnnotations }}
{{- toYaml .Values.podAnnotations }}
{{- end }}
{{- end }}

{{/*
Additional labels for Pods
*/}}
{{- define "satellite.podLabels" -}}
{{- if .Values.podLabels }}
{{- toYaml .Values.podLabels }}
{{- end }}
{{- end }}

{{/*
Additional annotations for the Service
*/}}
{{- define "satellite.serviceAnnotations" -}}
{{- if .Values.service.annotations }}
{{- toYaml .Values.service.annotations }}
{{- end }}
{{- end }}

{{/*
Additional labels for the Service
*/}}
{{- define "satellite.serviceLabels" -}}
{{- if .Values.service.labels }}
{{- toYaml .Values.service.labels }}
{{- end }}
{{- end }}

{{/*
Additional labels for the Service Monitor
*/}}
{{- define "satellite.serviceMonitorLabels" -}}
{{- if .Values.serviceMonitor.labels }}
{{- toYaml .Values.serviceMonitor.labels }}
{{- end }}
{{- end }}
