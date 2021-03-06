(function ($, O2) {
  /**
   * @property bar.View
   */
  O2.createClass('bar.View', {
    $contentWrapper: null,
    __construct: function () {
      this.$contentWrapper = $('#contentWrapper')
    },
    showHome: function () {
      var $aCat = {}
      var $accordion = $('<ul class="collapsible" data-collapsible="expandable">')
        .appendTo($('<div class="col s12">').appendTo(this.$contentWrapper))
      $.each(bar.store.categories, function (i, oCat) {
        var $el = $('<div class="collapsible-body row">')
        $aCat[oCat.id] = $el
        $('<li><div class="collapsible-header"><span class="badge"></span><i class="material-icons">' + oCat.icon + '</i>' + oCat.label + '</div></li>')
          .appendTo($accordion)
          .append($el)
      })
      $.each(bar.store.articles, function (i, oArt) {
        $('<div class="col s6 m3 artCard">' +
          '<div class="card">' +
          '<div class="card-image">' +
          '<img class="activator" src="src/img/' + oArt.id + '.jpg">' +
          '<div class="floatingArea">' +
          '<a class="btn-floating waves-effect waves-light orange"><i class="material-icons">&#xE15B;</i></a>' +
          '<input type="number" name="cmd[' + oArt.id + ']" min="0" value="0"/>' +
          '<a class="btn-floating waves-effect waves-light blue add"><i class="material-icons">&#xE145;</i></a>' +
          '</div>' +
          '<div class="starswitch"><label class="btn-floating waves-effect white"><input type="checkbox" ' + (bar.store.login && bar.store.login.pref.indexOf(oArt.id) !== -1 ? 'checked="checked"' : '') + ' name="fav[]" value="' + oArt.id + '"><i class="material-icons blue-text star">&#xE838;</i><i class="material-icons black-text">&#xE83A;</i></label></div>' +
          '</div>' +
          '<div class="card-content not-too-large">' +
          '<span class="card-title activator black-text truncate">' + oArt.label + '</span>' +
          '<p>' + oArt.prix + '€<i class="material-icons activator right">more_vert</i></p>' +
          '</div>' +
          '<div class="card-reveal">' +
          '<span class="card-title grey-text text-darken-4">' + oArt.label + '<i class="material-icons right">close</i></span>' +
          '<p>' + (oArt.desc || 'Aucune description') + '</p>' +
          '</div>' +
          '</div>' +
          '</div>')
          .appendTo($aCat[oArt.cat])

      })
      this.$contentWrapper
        .find('.floatingArea .btn-floating')
        .on('click', function () {
          var $this = $(this)
          var $input = $this.siblings('input')
          if ($this.hasClass('add')) {
            $input.val(+$input.val() + 1)
          } else {
            var val = +$input.val() - 1
            if (val >= 0) {
              $input.val(+$input.val() - 1)
            }
          }
          $input.trigger('change')
        })
      this.$contentWrapper
        .find('.starswitch input')
        .on('change', function () {
          var $this = $(this)
          if (this.checked) {
            $(this).attr('checked', 'checked')
          } else {
            $(this).attr('checked', null)
          }
        })
      $accordion.collapsible()
    },
    makeUserAddons: function () {
      var oldVal = null
      if ($.isPlainObject(bar.store.users)) {
        if (this.$userAddons) {
          var oUser = this.$contentWrapper.serializeObject()['user']
          if (oUser) {
            oldVal = { user: this.$contentWrapper.serializeObject()['user'] }
          }
          this.$userAddons.remove()
        }
        var $wrapper = this.$userAddons = $('<div class="input-field col s12">')
        $('<i class="material-icons prefix">&#xE8EF;</i>').appendTo($wrapper)
        var $input = $('<input data-target="quickBillModal" class="" readonly="true" data-activates="select-user-pref" value="Choisissez des participants..." type="text" />').appendTo($wrapper)
        var $modalWrapper = $('<div id="quickBillModal" class="modal bottom-sheet">').appendTo($wrapper)
        var $modalContent = $('<div class="modal-content">').appendTo($modalWrapper)
        var $ul = $('<ul class="modal-list">').appendTo($modalContent)
        var $li = $()
        $.each(bar.store.users, function (idUser, oUser) {
          $('<li class="optgroup"><span>' + oUser.label + '</span></li>').appendTo($ul)
          if (Array.isArray(oUser.pref)) {
            oUser.pref.forEach(function (pref) {
              if (bar.store.articles[pref]) {
                $li.push($('<li class="optgroup-option"><span><input type="checkbox" name="user[' + idUser + ']" value="' + pref + '"><label></label>' + bar.store.articles[pref].label + '</span></li>').appendTo($ul)[0])
              }
            })
          }
        })
        $wrapper.append('<label class="active">QuickBill</label>')
        $li.on('click', function (e) {
          var $this = $(this)
          e.stopPropagation()
          e.preventDefault()
          if ($this.is('.optgroup-option:not(.disabled)')) {
            var $checkbox = $this.find('input[type="checkbox"]')
            var checked = $checkbox.prop('checked', function (i, v) {
              return !v
            })
            $checkbox.trigger('change')
          }
        })
          .find('input[type="checkbox"]')
          .on('change', function () {
            var articles = {}
            var $this = $(this)
            var $parent = $this.closest('li')
            if ($this.prop('checked')) {
              $parent.addClass('active')
              var $el = $()
                .add($parent.prevUntil('.optgroup', '.active'))
                .add($parent.nextUntil('.optgroup', '.active'))
              $el.trigger('click')
            } else {
              $parent.removeClass('active')
            }
            $li.filter('.active').each(function () {
              var text = $(this).text()
              articles[text] = articles[text] ? articles[text] + 1 : 1
            })

            var value = ''
            for (var v in articles) {
              if (value) value += ', '
              value += articles[v] + ' ' + v
            }
            $input.val(value || 'Choisissez des participants...')
          })
        this.$contentWrapper.on('reset', function () {
          $li.removeClass('active')
        })
        $wrapper.prependTo(this.$contentWrapper)
        $input
          .on('click', function () {
            window.location.hash = 'quickBill'
          })
        $modalWrapper.modal()

        $(window).on('hashchange', function () {
          if ($modalWrapper.hasClass('open') && window.location.hash !== '#quickBill') {
            $modalWrapper.modal('close')
          }
        })
        if (oldVal) {
          this.$contentWrapper.deserializeObject(oldVal)
        }
      }
    },
    _get$tab: function (title, oCommande) {
      var oTab = {
        $tab: null,
        $content: null
      }
      oTab.$tab = $('<li class="tab col s3"><a href="#' + title + '">' + title + '</a></li>')
      oTab.$content = $('<div id="' + title + '" class="col s12">')
      oTab.$content.append('<h3>Total :' + oCommande.getPrix() + '€<h3>')
      var $table = $('<table class="striped bordered highlight">').appendTo(oTab.$content)
      $table.append('<tr><th>Article</th><th>Quantité</th><th>Prix</th></tr>')
      oCommande.getCommande().forEach(function (c) {
        if (c && c.qt) {
          $table.append('<tr><td>' + c.label + '</td><td>' + c.qt + '</td><td>' + Math.round((c.qt * c.prix) * 100) / 100 + '€</td></tr>')
        }
      })
      return oTab
    },
    _getAll$tab: function (oCommande, nbCarte, algo) {
      var self = this
      var aTab = []
      aTab.push(this._get$tab('S', oCommande))
      if (nbCarte > 1) {
        oCommande[algo](nbCarte).forEach(function (subCommande) {
          aTab.push(self._get$tab((subCommande.id + 1), subCommande))
        })
      }
      return aTab
    },
    showFacture: function (oCommande, nbCarte, algo) {
      algo = algo || 'auPlusEquitable'
      var $modalContent = $('<div class="col s12 fixed-tabs-wrapper">')
      nbCarte = ~~nbCarte
      if (!nbCarte) {
        Materialize.toast('Vous devez au moins avoir une carte', 2000)
        return
      }
      if (nbCarte < 0) {
        Materialize.toast('Le bar ne fait pas crédit !', 2000)
        return
      }
      if (oCommande.getPrix() !== 0) {
        var $tabsWrapper = $('<ul class="tabs tabs-fixed-width">').appendTo($modalContent)

        var all$tab = this._getAll$tab(oCommande, nbCarte, algo)

        all$tab.forEach(function (oTab) {
          $tabsWrapper.append(oTab.$tab)
          $modalContent.append(oTab.$content)
        })
      } else {
        Materialize.toast('Votre commande est vide', 2000)
        return
      }
      return Materializer.createModal({
        content: $modalContent,
        type: 'modal-fixed-footer',
        footer: {
          'Annuler': {
            'classe': 'modal-close'
          },
          'Enregistrer et vider': {
            'callback': function (modal, button) {
              button.on('click', function () {
                oCommande.toLocalStorage()
                $('#resetBtn').trigger('click')
                modal.modal('close')
              })
            }
          },
          'Enregistrer': {
            'callback': function (modal, button) {
              button.on('click', function () {
                oCommande.toLocalStorage()
                modal.modal('close')
              })
            }
          }
        }
      })
    },
    showHistory: function (oHistory) {
      if ($.isEmptyObject(oHistory)) {
        Materialize.toast('L\'historique est vide', 2000)
        return
      }
      var $modalContent = $('<div class="col s12 fixed-tabs-wrapper">')
      var $accordion = $('<ul class="collapsible" data-collapsible="expandable">')
        .appendTo($modalContent)
      for (var date in oHistory) {
        $accordion.prepend(this._get$accordion(date, oHistory[date]))
      }
      var $modal = Materializer.createModal({
        content: $modalContent,
        type: 'modal-fixed-footer',
        header: 'Historique',
        footer: {
          'Fermer': {
            'classe': 'modal-close'
          }
        }
      })
      $accordion.collapsible()
      return $modal
    },
    _get$accordion: function (date, oForm) {
      var self = this
      var $body = $('<div class="collapsible-body col s12">')
      var sDate = new Date(date)
      sDate = sDate.toFrench()
      var headerText = sDate
      if (!$.isEmptyObject(oForm.user)) {
        var nbUser = 0
        var $habitue = $('<table class="striped bordered highlight">').appendTo($body)
        $habitue.append('<tr><th style="width: 50%;">Habitué</th><th>Boisson</th></tr>')
        $.each(oForm.user, function (i, v) {
          if (v !== null) {
            $habitue.append('<tr><td>' + bar.store.users[i].label + '</td><td>' + bar.store.articles[v].label + '</td></tr>')
            nbUser++
          }
        })
        headerText += ' - ' + nbUser + ' habitué' + bar.helper.pluralize(nbUser)
      }
      if (!$.isEmptyObject(oForm.cmd)) {
        var nbCommande = 0
        var $complement = $('<table class="striped bordered highlight">').appendTo($body)
        $complement.append('<tr><th style="width: 50%;">Article</th><th>Quantité</th></tr>')
        $.each(oForm.cmd, function (i, v) {
          if (bar.store.articles[i]) {
            $complement.append('<tr><td>' + bar.store.articles[i].label + '</td><td>' + v + '</td></tr>')
            nbCommande++
          }
        })
        headerText += ' - ' + nbCommande + ' complément' + bar.helper.pluralize(nbCommande)
      }
      var $footer = $('<div class="right-align">').prependTo($body)
      // Supprimer
      $('<a class="btn btn-floating waves-effect waves-light btn red"><i class="material-icons right">&#xE92B;</i></a>')
        .appendTo($footer)
        .on('click', function () {
          var $li = $(this).closest('li.active')
          var $collapsible = $li.closest('.collapsible')
          $collapsible.collapsible('close', $collapsible.find('li').index($li))
          Vel(
            $li,
            {
              'opacity': 0,
              marginLeft: '-50%',
              height: 0
            },
            {
              duration: 375,
              easing: 'easeOutExpo',
              queue: false,
              delay: 375,
              complete: function () { $li.addClass('hide') }
            }
          )
          var json = {}
          json[date] = null
          bar.helper.storage.export(json)
        })
      // Restaurer
      $('<a class="btn btn-floating waves-effect waves-light btn green"><i class="material-icons right">&#xE889;</i></a>')
        .appendTo($footer)
        .on('click', function () {
          self.$contentWrapper.deserializeObject(oForm)
          $(this).closest('.modal').modal('close')
          Materialize.toast('Restauration terminée !', 2000)
        })
      return $('<li><div class="collapsible-header truncate"><i class="material-icons">&#xE889;</i>' + headerText + '</div></li>')
        .append($body)
    }
  })
})(jQuery, O2)
