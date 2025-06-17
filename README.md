# TodoApp

[![Deploy Status](https://github.com/maxuber79/claimsaapp/actions/workflows/deploy.yml/badge.svg)](https://github.com/maxuber79/claimsaapp/actions)

Aplicación Angular generada con [Angular CLI](https://github.com/angular/angular-cli) versión 19.2.14

🌐 **Ver sitio en producción**:  
🔗 https://maxuber79.github.io/claimsaapp/

---

## 🚀 Deploy automático

Este proyecto está configurado para hacer deploy automático a GitHub Pages cada vez que haces `push` a la rama `master`.

- Usa GitHub Actions + `JamesIves/github-pages-deploy-action`
- Build de producción con `ng build --configuration=production`
- Publicación directa desde `dist/claimsaapp` al branch `gh-pages`

### ¿Quieres forzar un redeploy manual?

```bash
git commit --allow-empty -m "🚀 Forzar nuevo deploy"
git push origin master

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.2.14

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
