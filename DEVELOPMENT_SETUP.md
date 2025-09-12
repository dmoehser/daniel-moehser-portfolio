# Deutsche Lokalisierung Setup
# ============================

## Übersicht

Dieses Setup ermöglicht es, dein Portfolio sowohl auf Englisch (localhost:8080) als auch auf Deutsch (de.localhost:8080) zu betreiben.

## Voraussetzungen

- Docker und Docker Compose installiert
- Lokale Entwicklungsumgebung läuft

## Setup-Schritte

### 1. Hosts-Datei konfigurieren

Füge folgende Zeilen zu deiner `/etc/hosts` Datei hinzu:

```
127.0.0.1 localhost
127.0.0.1 de.localhost
```

**macOS/Linux:**
```bash
sudo nano /etc/hosts
```

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts
```

### 2. Docker Container neu starten

```bash
cd /Users/danielmoehser/Documents/Web\ Project/Wordpress/projects/moehser-portfolio
docker compose down
docker compose up -d
```

### 3. WordPress Multisite einrichten

1. Gehe zu `http://localhost:8080/wp-admin`
2. Führe die Multisite-Einrichtung durch
3. Erstelle eine neue Site für Deutsch:
   - Site-URL: `de.localhost:8080`
   - Site-Titel: "Daniel Moehser Portfolio (DE)"

### 4. Theme aktivieren

1. Aktiviere das `moehser-portfolio` Theme für beide Sites
2. Gehe zu Design > Customizer
3. Konfiguriere die deutschen Einstellungen unter "Profil-Einstellungen (Deutsch)"

### 5. Deutsche Inhalte erstellen

#### About-Seite (Deutsch)
1. Erstelle eine neue Seite: "Über mich"
2. Füge deutschen Inhalt hinzu
3. Wähle diese Seite im Customizer unter "About-Inhalt Seite (Deutsch)"

#### Impressum-Seite (Deutsch)
1. Erstelle eine neue Seite: "Impressum"
2. Füge deutsches Impressum hinzu
3. Wähle diese Seite im Customizer unter "Impressum-Inhalt Seite (Deutsch)"

#### Projekte (Deutsch)
1. Gehe zu Projekte > Alle Projekte
2. Bearbeite jedes Projekt
3. Füge deutsche Übersetzungen in den Custom Fields hinzu:
   - `project_title_de`: Deutscher Titel
   - `project_content_de`: Deutscher Inhalt
   - `project_excerpt_de`: Deutsche Zusammenfassung

### 6. Skills-Karten (Deutsch)

Im Customizer unter "Profil-Einstellungen (Deutsch)" konfigurieren:

- **Card 1**: Frontend-Entwicklung
- **Card 2**: Backend-Entwicklung  
- **Card 3**: Design & UX
- **Card 4**: DevOps & Tools
- **Card 5**: Mobile Entwicklung

## URLs

- **Englisch**: `http://localhost:8080`
- **Deutsch**: `http://de.localhost:8080`

## Features

### Automatische Spracherkennung
- Browser-Sprache wird automatisch erkannt
- Benutzer werden zur passenden Sprachversion weitergeleitet
- Cookie speichert Sprachpräferenz

### Sprachwechsel
- Language Switcher in der Navigation
- Ein-Klick-Wechsel zwischen den Sprachen
- Beibehaltung der aktuellen Seite

### Mehrsprachige Inhalte
- Alle Texte über Customizer konfigurierbar
- Projekte mit deutschen Übersetzungen
- Separate About- und Impressum-Seiten

## Entwicklung

### Neue Komponenten
Verwende den `useLanguage` Hook:

```javascript
import { useLanguage } from '../hooks/useLanguage.js';

function MyComponent() {
  const { isGerman, t } = useLanguage();
  
  return (
    <h1>{isGerman ? 'Deutscher Titel' : 'English Title'}</h1>
  );
}
```

### SCSS Styling
```scss
// Language-specific styles
.language-switcher {
  // Styles hier
}
```

## Troubleshooting

### Subdomain funktioniert nicht
1. Überprüfe die hosts-Datei
2. Starte Docker neu
3. Leere den Browser-Cache

### Deutsche Inhalte werden nicht angezeigt
1. Überprüfe Customizer-Einstellungen
2. Stelle sicher, dass die richtigen Seiten ausgewählt sind
3. Überprüfe die REST API: `/wp-json/moehser/v1/content`

### Performance-Probleme
1. Aktiviere Caching
2. Optimiere Bilder
3. Verwende CDN für statische Assets

## Deployment

### Produktions-URLs
- **Englisch**: `https://danielmoehser.dev`
- **Deutsch**: `https://de.danielmoehser.dev`

### DNS-Konfiguration
Erstelle A-Records für beide Subdomains:
- `danielmoehser.dev` → Server IP
- `de.danielmoehser.dev` → Server IP

### SSL-Zertifikate
Stelle sicher, dass beide Subdomains im SSL-Zertifikat enthalten sind.
