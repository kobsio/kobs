{{/*
Expand the name of the chart.
*/}}
{{- define "kobs.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "kobs.fullname" -}}
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
{{- define "kobs.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

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
{{- end }}

{{/*
Selector labels
*/}}
{{- define "kobs.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kobs.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use for the kobs cluster component
*/}}
{{- define "cluster.serviceAccountName" -}}
{{- if .Values.cluster.serviceAccount.enabled -}}
    {{ default (printf "%s-%s" (include "kobs.fullname" .) "cluster") .Values.cluster.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.cluster.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the cluster role and cluster role binding to use for the kobs cluster component
*/}}
{{- define "cluster.rbacName" -}}
{{- if .Values.cluster.rbac.enabled -}}
    {{ default (printf "%s-%s" (include "kobs.fullname" .) "cluster") .Values.cluster.rbac.name }}
{{- else -}}
    {{ default "default" .Values.cluster.rbac.name }}
{{- end -}}
{{- end -}}
