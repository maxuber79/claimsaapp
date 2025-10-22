<div align="center">

# 🧾 ClaimsaApp — Sistema de Reclamos con Angular + Firebase

[![Deploy Status](https://github.com/maxuber79/claimsaapp/actions/workflows/deploy.yml/badge.svg)](https://github.com/maxuber79/claimsaapp/actions)
[![Angular](https://img.shields.io/badge/Angular-19.2.14-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-181717?logo=github)](https://maxuber79.github.io/claimsaapp/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

💡 Aplicación moderna de gestión de reclamos desarrollada en **Angular 19** con integración completa a **Firebase (Auth, Firestore, Storage)**.  
Diseñada para mostrar métricas, notificaciones y paneles tipo dashboard para usuarios Administradores y Ejecutivos.

🔗 **Ver demo en producción:**  
👉 [https://maxuber79.github.io/claimsaapp/](https://maxuber79.github.io/claimsaapp/)

</div>

---

## 🧱 Tecnologías principales

| Módulo | Descripción |
|--------|-------------|
| **Angular 19.2.14** | Framework principal frontend |
| **Firebase** | Autenticación, Firestore y Storage |
| **Bootstrap 5** | Estilos responsivos y componentes UI |
| **Chart.js** | Gráficos estadísticos del dashboard |
| **GitHub Actions** | CI/CD para deploy automático |
| **GitHub Pages** | Hosting estático de la aplicación |

---

## 🚀 Deploy automático

Este proyecto realiza **deploy automático** a **GitHub Pages** cada vez que haces `push` a la rama `master`.

### ⚙️ Flujo CI/CD
1. Build de producción con:
	 ```bash
	 ng build --configuration=production
	 ```
2. Publicación desde `/dist/claimsaapp` a la rama `gh-pages`
3. Automatizado mediante **JamesIves/github-pages-deploy-action**

### 🔁 Forzar un redeploy manual
```bash
git commit --allow-empty -m "🚀 Forzar nuevo deploy"
git push origin master
```

---

## 🧠 Descripción funcional

ClaimsaApp permite:
- Autenticación de usuarios (Administrador / Ejecutivo)
- Gestión y asignación de reclamos por usuario
- Notificaciones en tiempo real
- Dashboard con KPIs, gráficos de satisfacción y origen de reclamos
- Roles diferenciados en UI según permisos

---

## ⚒️ Scripts útiles

### Servidor de desarrollo
```bash
ng serve
```
Luego abre [http://localhost:4200](http://localhost:4200)

### Generar componentes
```bash
ng generate component component-name
```

### Build de producción
```bash
ng build --configuration=production
```

### Ejecutar tests unitarios
```bash
ng test
```

---

## 📂 Estructura principal del proyecto

```
src/
 ├── app/
 │   ├── pages/              # Componentes de vistas principales
 │   ├── services/           # Firebase, claims, users, notifications
 │   ├── components/         # Componentes reutilizables
 │   ├── models/             # Interfaces y tipados
 │   ├── assets/data/        # Datos dummy JSON
 │   └── app.routes.ts       # Rutas principales
 ├── environments/           # Configuración Firebase
 └── index.html
```

---

## 🔥 Integraciones Firebase

| Servicio | Uso |
|-----------|-----|
| **Auth** | Registro, login y control de sesiones |
| **Firestore** | Almacenamiento de reclamos y usuarios |
| **Storage** | Subida y visualización de imágenes (perfil, adjuntos) |
| **Hosting (local)** | Pruebas y previsualización local |

---

## 💬 Desarrollo local

```bash
npm install
ng serve
```
Para entrar al sistema, crea un usuario en Firebase Authentication o utiliza uno de prueba definido en tu `auth.service.ts`.

---

## 🧑‍💻 Autor

**Claudio (WEBMAIN)**  
🌍 Chile  
💼 Desarrollador Frontend / Publicista Digital  
📫 [github.com/maxuber79](https://github.com/maxuber79)

---

<div align="center">
	<br>
	<img src="https://angular.io/assets/images/logos/angular/angular.svg" width="80">
	<img src="https://firebase.google.com/images/brand-guidelines/logo-vertical.png" width="90">
	<br><br>
	<b>✨ ClaimsaApp — Hecho con Angular, Firebase y mucha cafeína ☕</b>
</div>
