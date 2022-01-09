{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "kobs.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "kobs.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "kobs.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "kobs.labels" -}}
helm.sh/chart: {{ include "kobs.chart" . }}
{{ include "kobs.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "kobs.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kobs.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "kobs.serviceAccountName" -}}
{{- if .Values.serviceAccount.enabled -}}
    {{ default (include "kobs.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the cluster role and cluster role binding to use
*/}}
{{- define "kobs.rbacName" -}}
{{- if .Values.rbac.enabled -}}
    {{ default (include "kobs.fullname" .) .Values.rbac.name }}
{{- else -}}
    {{ default "default" .Values.rbac.name }}
{{- end -}}
{{- end -}}

{{/*
Additional annotations for Pods
*/}}
{{- define "kobs.podAnnotations" -}}
{{- if .Values.kobs.annotations }}
{{- toYaml .Values.kobs.annotations }}
{{- end }}
{{- end }}

{{/*
Additional labels for Pods
*/}}
{{- define "kobs.podLabels" -}}
{{- if .Values.kobs.labels }}
{{- toYaml .Values.kobs.labels }}
{{- end }}
{{- end }}

{{/*
Additional annotations for the Service
*/}}
{{- define "kobs.serviceAnnotations" -}}
{{- if .Values.service.annotations }}
{{- toYaml .Values.service.annotations }}
{{- end }}
{{- end }}

{{/*
Additional labels for the Service
*/}}
{{- define "kobs.serviceLabels" -}}
{{- if .Values.service.labels }}
{{- toYaml .Values.service.labels }}
{{- end }}
{{- end }}

{{/*
Additional labels for the Service Monitor
*/}}
{{- define "kobs.serviceMonitorLabels" -}}
{{- if .Values.serviceMonitor.labels }}
{{- toYaml .Values.serviceMonitor.labels }}
{{- end }}
{{- end }}
