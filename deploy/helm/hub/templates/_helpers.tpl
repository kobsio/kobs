{{/*
Expand the name of the chart.
*/}}
{{- define "hub.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "hub.fullname" -}}
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
{{- define "hub.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "hub.labels" -}}
helm.sh/chart: {{ include "hub.chart" . }}
{{ include "hub.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "hub.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hub.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Additional annotations for Pods
*/}}
{{- define "hub.podAnnotations" -}}
{{- if .Values.podAnnotations }}
{{- toYaml .Values.podAnnotations }}
{{- end }}
{{- end }}

{{/*
Additional labels for Pods
*/}}
{{- define "hub.podLabels" -}}
{{- if .Values.podLabels }}
{{- toYaml .Values.podLabels }}
{{- end }}
{{- end }}

{{/*
Additional annotations for the Service
*/}}
{{- define "hub.serviceAnnotations" -}}
{{- if .Values.service.annotations }}
{{- toYaml .Values.service.annotations }}
{{- end }}
{{- end }}

{{/*
Additional labels for the Service
*/}}
{{- define "hub.serviceLabels" -}}
{{- if .Values.service.labels }}
{{- toYaml .Values.service.labels }}
{{- end }}
{{- end }}

{{/*
Additional labels for the Service Monitor
*/}}
{{- define "hub.serviceMonitorLabels" -}}
{{- if .Values.serviceMonitor.labels }}
{{- toYaml .Values.serviceMonitor.labels }}
{{- end }}
{{- end }}

{{/*
Common labels for the watcher
*/}}
{{- define "hub.watcher.labels" -}}
helm.sh/chart: {{ include "hub.chart" . }}
{{ include "hub.watcher.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels for the watcher
*/}}
{{- define "hub.watcher.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hub.name" . }}-watcher
app.kubernetes.io/instance: {{ .Release.Name }}-watcher
{{- end }}

{{/*
Additional annotations for watcher Pods
*/}}
{{- define "hub.watcher.podAnnotations" -}}
{{- if .Values.watcher.podAnnotations }}
{{- toYaml .Values.watcher.podAnnotations }}
{{- end }}
{{- end }}

{{/*
Additional labels for watcher Pods
*/}}
{{- define "hub.watcher.podLabels" -}}
{{- if .Values.watcher.podLabels }}
{{- toYaml .Values.watcher.podLabels }}
{{- end }}
{{- end }}

{{/*
Additional annotations for the watcher Service
*/}}
{{- define "hub.watcher.serviceAnnotations" -}}
{{- if .Values.watcher.service.annotations }}
{{- toYaml .Values.watcher.service.annotations }}
{{- end }}
{{- end }}

{{/*
Additional labels for the watcher Service
*/}}
{{- define "hub.watcher.serviceLabels" -}}
{{- if .Values.watcher.service.labels }}
{{- toYaml .Values.watcher.service.labels }}
{{- end }}
{{- end }}

{{/*
Additional labels for the watcher Service Monitor
*/}}
{{- define "hub.watcher.serviceMonitorLabels" -}}
{{- if .Values.watcher.serviceMonitor.labels }}
{{- toYaml .Values.watcher.serviceMonitor.labels }}
{{- end }}
{{- end }}
