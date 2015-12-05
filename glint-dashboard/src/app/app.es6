import 'bootstrap-material-design/dist/js/material.min';



export class App {
  configureRouter(config, router) {
    config.title = 'Glint Dashboard';
    config.map([
      {route: ['', 'home'], name: 'home', moduleId: 'home', nav: true, title: 'Home'},
      {route: ['/repl', 'repl'], name: 'repl', moduleId: 'repl', nav: true, title: 'REPL'}
    ]);

    this.router = router;
  }

  attached() {
    $.material.init();
  }
}
