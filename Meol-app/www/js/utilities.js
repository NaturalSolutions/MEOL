"use strict";


// -------------------------------------------------- Utilities ---------------------------------------------------- //
// The Template Loader. Used to asynchronously load templates located in separate .html files
directory.utils.templateLoader = {
    templates: {},

    load: function(names) {
        //var deferreds = [], self = this;
        var self = this;
        $.each(names, function(index, name) {
            deferreds.push($.get('tpl/' + name + '.html', function(data) {
                console.log('load ' + name);
                self.templates[name] = data;
            }));
        });

        //$.when.apply(null, deferreds).done(callback);
    },

    // Get template by name from hash of preloaded templates
    get: function(name) {
        return this.templates[name];
    }

};

// Le but: f(0) = 0 , f(1)= 1  et f(n)= f(n-1)+f(n-2) ;
var fiboSuite = function(){
   var memo =[0,1] ; // variable cloturée = inaccessible hors de la fonction.
   var fibo = function(n){
                      if(n<2) return n ;
                      if(memo[n]) return memo[n];
                      memo[n]= fibo(n-1) + fibo(n-2) ;
                      return memo[n] ;
   }
   return fibo ;
}

//Shuffle
function shuffle(a){
   var j = 0;
   var valI = '';
   var valJ = valI;
   var l = a.length - 1;
   while(l > -1)
   {
		j = Math.floor(Math.random() * l);
		valI = a[l];
		valJ = a[j];
		a[l] = valJ;
		a[j] = valI;
		l = l - 1;
	}
	return a;
  }