class SR5Roller {
  static Init(controls, html) {
    const diceRollButton = $(`<li class="scene-control sdr-scene-control" data-control="simple-dice-roller" title="Simple Dice Roller">
                <i class="fas fa-dice-d20"></i>`);

    html.append(diceRollButton);
    html.find(".sdr-scene-control").click(() => this._onRoll());
  }

  static _onRoll() {
    const roll = async (count, limit, explode) => {
      if (count > 99) {
        ChatMessage.create({
          content: `${game.user.name}, nice try, Chummer!`,
        });
        return;
      }

      let formula = `${count}d6`;
      if (explode) {
        formula += "x6";
      }
      if (limit) {
        formula += `kh${limit}`;
      }

      formula += "cs>=5";

      let roll = new Roll(formula);
      let title = "Roll";
      let rollMode = game.settings.get("core", "rollMode");

      roll.toMessage({
        //speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: title,
        rollMode: rollMode,
      });

      console.log(roll.formula);
      console.log(limit);

      return roll;
    };

    let total = 0;
    let limit = 0;
    let edge = false;

    let template = "systems/shadowrun5e/templates/rolls/basic-roll.html";
    let cancel = true;
    let dialogOptions = {};

    let dialogData = {
      options: dialogOptions,
      dice_pool: total,
      limit: limit,
    };

    return new Promise((resolve) => {
      renderTemplate(template, dialogData).then((dlg) => {
        let d = new Dialog({
          title: "Roll Dialog",
          content: dlg,
          buttons: {
            roll: {
              label: "Roll",
              icon: '<i class="fas fa-dice-six"></i>',
              callback: () => {
                edge = false;
                cancel = false;
              },
            },
            edge: {
              label: "Push the Limit",
              icon: '<i class="fas fa-bomb"></i>',
              callback: () => {
                edge = true;
                cancel = false;
              },
            },
          },
          default: "two",
          close: (html) => {
            if (cancel) return;
            total = parseInt(html.find('[name="dice_pool"]').val());
            limit = parseInt(html.find('[name="limit"]').val());
            dialogOptions = {
              ...dialogOptions,
              environmental: parseInt(
                html.find('[name="options.environmental"]').val()
              ),
            };

            if (dialogOptions.environmental)
              total -= dialogOptions.environmental;

            roll(total, edge ? undefined : limit, edge);
          },
        });
        d.render(true);
      });
    });
  }
}

Hooks.on("renderSceneControls", (controls, html) => {
  SR5Roller.Init(controls, html);
});
console.log("SRDR | SR5 Simple Dice Roller loaded");
