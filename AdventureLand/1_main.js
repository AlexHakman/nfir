load_code(31); // character helper
load_code(32); // party helper
load_code(33); // shared methods
load_code(34); // map helpers
load_code(35); // movement

load_code(36); // keyboard
load_code(91); // DPS meter
load_code(92); // mini map
load_code(98); // Commands
load_code(99); // upload code

load_code(20); // Character base class
load_code(21); // Mage
load_code(22); // Ranger
load_code(23); // Warrior
load_code(24); // Priest

let char;

switch(character.ctype) {
    case 'warrior':
        char = new Warrior();
        break;
    case 'ranger':
        char = new Ranger();
        break;
    case 'mage':
        char = new Mage();
        break;
    case 'priest':
        char = new Priest();
        break;
}

setInterval(char.run.bind(char), 200);

setInterval(() => {
    if(character.party && character.party === character.name) {
        const target = get_targeted_monster();
        if(target) {
            const members = Object.keys(parent.party);
            for(let n of members) {
                if(n === character.name) continue;
                send_cm(n, {type: 'combatLocation', data: {x: character.x, y: character.y, map: character.map, mtype: target.type}});
            }
        }
    }
}, 5000);

const townButton = parent.document.getElementsByClassName('townb')[0];
townButton.addEventListener('click', port_to_town);