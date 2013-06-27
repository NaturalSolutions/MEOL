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
                self.templates[name] = data;
            }));
        });
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
   };
   return fibo ;
};

//Shuffle
function shuffle(myArray){
  var i = myArray.length, j, temp;
  if ( i === 0 ) return false;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = myArray[i];
     myArray[i] = myArray[j]; 
     myArray[j] = temp;
   }
   return myArray;
};

// capitaliseFirstLetter
function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
