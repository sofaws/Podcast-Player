// jshint esversion:6

window.addEventListener("load", function() {

    window.location.hash = "accueil";
    var listePodcast = new Map();
    var listeUrl = new Map();
    var listesRechargement = [];
    var lienLu = [];

    if (localStorage.getItem("lienlu") !== null) {
      lienLu = JSON.parse(localStorage.getItem("lienlu"));
    }

    //Recupere la liste de podcast en storage et la charge
    if (localStorage.getItem("liste") !== null) {
        var recupListe = JSON.parse(localStorage.getItem("liste"));
        if (recupListe !== null) {
            recupListe.forEach(function(url) {
                chargementStorage(url);
            });
        }
    }

    //Clique sur le bouton "charger un podcast"
    document.getElementById("valide").addEventListener("click", chargement);


    //Clique sur le bouton "Fermer l'aide"
    document.getElementById("aidebtn").addEventListener("click", function() {
        var aide = document.getElementById("aide");
        aide.style.display = "none";
    });

    //Clique sur le bouton effacer les podcasts
    document.getElementById("clear").addEventListener("click", function() {
        listesRechargement = null;
        window.location.hash = "accueil";
        localStorage.setItem("liste", null);
        document.location.reload(true);
    });

    //Clique sur le bouton "Fermer le podcast"
    document.getElementById("podbtn").addEventListener("click", function() {
        var pod = document.getElementById("contentpod");
        pod.style.display = "none";
    });


    //Lors d'un chargement d'hash :
    // - Si le hash est aide on affiche l'aide
    // - Si le hash est contenu dans la map, alors le podcast existe et donc on l'affiche
    // Sinon on fait rien
    window.addEventListener("hashchange", function() {
        var id = window.location.hash.substring(1);
        if (id === "aide") affichageAide();
        else if (id === "all") affichageAll();
        else if (listePodcast.has(id)) affichageChoix(id);

    });

    //Fonction qui affiche l'aide
    function affichageAide() {
        var pod = document.getElementById("contentpod");
        pod.style.display = "none";
        var aide = document.getElementById("aide");
        aide.style.display = "block";
    }



    //Fonction de chargement d'un podcast lors de l'appuie sur valider
    function chargement() {
        var url = document.getElementById("urlPodcast").value;
				document.getElementById("urlPodcast").value = "";
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "podcast.php?lien=" + url);

        xmlhttp.onerror = function() {
            alert("erreur");
        };

        xmlhttp.onload = function() {
            if (xmlhttp.status === 200) {
                listesRechargement.push(url);
                localStorage.setItem("liste", JSON.stringify(listesRechargement));
                var xmlDoc = xmlhttp.responseXML;
                AjoutPodcast(xmlDoc);
            } else {
                alert("Erreur chargement");
            }
        };
        xmlhttp.send();
    }

    //Fonction de chargement des podcast contenu en storage lors du chargement
    function chargementStorage(url) {

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "podcast.php?lien=" + url);

        xmlhttp.onerror = function() {
            alert("erreur");
        };

        xmlhttp.onload = function() {
            if (xmlhttp.status === 200) {
                listesRechargement.push(url);
                localStorage.setItem("liste", JSON.stringify(listesRechargement));
                var xmlDoc = xmlhttp.responseXML;
								console.log(xmlhttp.responseXML);
                AjoutPodcast(xmlDoc,url);
            } else {
                alert("Erreur chargement");
            }
        };
        xmlhttp.send();
    }

    //Permet d'ajouter un podcast a la map qui les contients
    function AjoutPodcast(xmlDoc,url) {
        var x = xmlDoc.getElementsByTagName("channel");
        for (var i = 0; i < x.length; i++) {
            var titreChaine = x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
            listePodcast.set(titreChaine, x[i]);
						listeUrl.set(titreChaine,url);
        }

        affichageListePodcasts();
    }

    //Permet d'afficher les podcasts dans le menu pour les choisirs
    function affichageListePodcasts() {
        var div = document.getElementById("listePodcasts");
        div.textContent = "";
        listePodcast.forEach(function(item, key, mapObj) {
            var a = document.createElement('a');
            a.href = "#" + key;
            a.textContent = key;
            a.className = "list-group-item";
						var a2 = document.createElement('a');
						a2.textContent = "Supprimer";
						a2.className = "list-group-item";
						a2.id = "delete";
						a2.href = "#Accueil";
            div.appendChild(a);
						div.appendChild(a2);

						a2.addEventListener("click",function(){
							listePodcast.delete(key);
							var url = listeUrl.get(key);
							var index = listesRechargement.indexOf(url);
							console.log(index);
							if (index > -1) listesRechargement.splice(index, 1);
							listeUrl.delete(key);
							localStorage.setItem("liste", JSON.stringify(listesRechargement));
							affichageListePodcasts();
						});
        });
    }

    //Permet d'afficher le podcast choisis
    function affichageChoix(key) {
        var pod = document.getElementById("contentpod");
        pod.style.display = "block";
        var aide = document.getElementById("aide");
        aide.style.display = "none";

        var div = document.getElementById("contentPodcasts");
        div.textContent = "";
        var doc = listePodcast.get(key);
        var titre = document.createElement('h1');
        titre.textContent = doc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
        var site = document.createElement('p');
        if (doc.getElementsByTagName("link")[0].childNodes[0] !== undefined) site.textContent = doc.getElementsByTagName("link")[0].childNodes[0].nodeValue;
        else site.textContent = doc.getElementsByTagName("link")[1].childNodes[0].nodeValue;

        div.appendChild(titre);
        div.appendChild(site);

        var x = doc.getElementsByTagName("item");
        var table = document.createElement('table');
        table.className = "table";
        div.appendChild(table);

        for (var i = 0; i < x.length; i++) {
            createTable(div, x, doc, table, i);
        }
    }

    //Permets l'affichage de tout les podcasts chargé
    function affichageAll() {
        //On affiche la div podcast et cache l'aide
        var pod = document.getElementById("contentpod");
        pod.style.display = "block";
        var aide = document.getElementById("aide");
        aide.style.display = "none";
        var div = document.getElementById("contentPodcasts");
        div.textContent = "";

        var table = document.createElement('table');
        table.className = "table";
        div.appendChild(table);

        listePodcast.forEach(function(doc, clé, map) {
            var x = doc.getElementsByTagName("item");
            for (var i = 0; i < x.length; i++) {
                createTable(div, x, doc, table, i);
            }
        });
    }


    //Permet de parser le xml pour afficher les données d'un item envoyé en paramètre sur la page
    function createTable(div, x, doc, table, i) {
        var tr = document.createElement('tr');
        table.appendChild(tr);

        var tdimage = document.createElement('td');
        var img = document.createElement('img');
        if (doc.getElementsByTagName("image")[0].getElementsByTagName("url")[0] !== undefined) img.src = doc.getElementsByTagName("image")[0].getElementsByTagName("url")[0].childNodes[0].nodeValue;
        img.style.width = "100px";
        img.style.height = "100px";
        tdimage.appendChild(img);

        var titre = document.createElement('td');
        titre.className = "titre";
        if (x[i].getElementsByTagName("title")[0].childNodes[0] !== undefined) titre.textContent = x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
        else titre.textContent = "Pas de titre";
        var desc = document.createElement('td');
        if (x[i].getElementsByTagName("description")[0] !== undefined) desc.textContent = x[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
        else desc.textContent = "Pas de description";
        var contentplay = document.createElement('td');
        var play = document.createElement('input');
        //var source =  document.createElement('source');
        play.id = x[i].getElementsByTagName("enclosure")[0].getAttribute("url");
        console.log(lienLu);
        if(lienLu.indexOf(play.id) !== -1)
        {
          play.style.backgroundColor = "#e3e3e3";
          play.style.color = "#3D7B80";
          }
        play.type = "button";
        play.value = "Lire";


        play.addEventListener("click", function() {
            lienLu.push(this.id);
            localStorage.setItem("lienlu", JSON.stringify(lienLu));
            var audio = document.getElementById("lecteur");
            audio.setAttribute("autoplay", "true");
            audio.src = this.id;
            audio.style.backgroundImage = 'url("' + img.src + '")';
            audio.style.backgroundRepeat = "no-repeat";
            audio.style.backgroundPosition = "center";
            audio.style.backgroundSize = "contain";
            this.style.backgroundColor = "#e3e3e3";
            this.style.color = "#3D7B80";
        });
        contentplay.appendChild(play);
        tr.appendChild(tdimage);
        tr.appendChild(titre);
        tr.appendChild(desc);
        tr.appendChild(contentplay);
    }
});
