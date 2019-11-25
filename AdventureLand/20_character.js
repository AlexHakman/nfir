class Character
{

    static get paused()
    {
        if(Character._paused === undefined) {
            Character._paused = false;
        }
        return Character._paused;
    }

    static set paused(val)
    {
        Character._paused = val;
    }

    constructor()
    {
        this.c = character;
        this.movingToLeader = false;
        this.movingToTarget = false;
    }

    run ()
    {
        if(typeof this.loop !== 'undefined' && !Character.paused) {
            this.loop();
        }
    }

    loop ()
    {
        if(need_potion() && can_use('hp')) {
            use('hp');
        }
        if(need_mana() && can_use('mp')) {
            use('mp');
        }

        loot();
    }

    kite(target)
    {
        if(smart.moving) {
            smart.moving = false;
            return stop('move');
        }
        const pos = MapHelper.getKitePosition(this.c, target);

        if(pos) move_to_position(pos);
    }

    moveToLeader(min = 5, max = 10)
    {
        if(!this.movingToLeader) {
            if(character.moving) {
                if(smart.moving) smart.moving = false;
                stop('move');
            }
            this.movingToLeader = true;
        }

        let leader = get_player(character.party);
        let range;
        if (leader) range = MapHelper.distanceToPoint(leader.real_x, leader.real_y) + 0.1;
        // If range is good stay
        if (range && (range <= max && range >= min)) return stop();
        // If smart moving past them stop
        if (range && smart.moving && range <= character.range) return stop();
        // If moving continue
        if (is_moving(character)) return;
        // Handle bank
        if (character.party && parent.party[character.party].map === 'bank') return shib_move('main');
        // Handle different map
        if (parent.party[character.party] && parent.party[character.party].map !== character.map) return shib_move(parent.party[character.party].map);
        // Handle same map but far away
        if (!range || !parent.entities[character.party] || range >= character.range * 4) {
            if (leader) move_to_coords(leader.x, leader.y); else return shib_move(parent.party[character.party].x, parent.party[character.party].y);
        }
        // Handle close
        if (leader && (range > max || range < min || !range)) move_to_coords(leader.real_x + getRndInteger(((min + max)/2) * -1, ((min + max)/2)), leader.real_y + getRndInteger(((min + max)/2) * -1, ((min + max)/2))); else if (!leader) shib_move(parent.party[character.party].x + getRndInteger(((min + max)/2) * -1, ((min + max)/2)), parent.party[character.party].y + getRndInteger(((min + max)/2) * -1, ((min + max)/2)));
    }

    moveToTarget(target, min = 0, max = 0)
    {
        if(!this.movingToTarget) {
            if(character.moving) {
                if(smart.moving) smart.moving = false;
                stop('move');
            }
            this.movingToTarget = true;
        }

        let range;
        if (target) range = MapHelper.distanceToPoint(target.real_x, target.real_y) + 0.1;
        // If range is good stay
        if (range && (range <= max && range >= min)) return stop();
        // If smart moving past them stop
        if (range && smart.moving && range <= character.range) return stop();
        // If moving continue
        if (is_moving(character)) return;
        // Handle different map
        if (parent.party[character.party] && parent.party[character.party].map !== character.map) return shib_move(parent.party[character.party].map);
        // Handle same map but far away
        if (!range || !parent.entities[character.party] || range >= character.range * 4) {
            if (target) move_to_coords(target.real_x, target.real_y); else return shib_move(target);
        }
        // Handle close
        if (target && (range > max || range < min || !range)) move_to_coords(target.real_x + getRndInteger(((min + max)/2) * -1, ((min + max)/2)), target.real_y + getRndInteger(((min + max)/2) * -1, ((min + max)/2)));
    }

    potions () // WIPs
    {
        const hpot = num_items('hpot1') > 0 ? 'hpot1' : (num_items('hpot0') > 0 ? 'hpot0' : null);
        const mpot = num_items('mpot1') > 0 ? 'mpot1' : (num_items('mpot0') > 0 ? 'mpot0' : null);

        if(can_use('hp') && hpot && (character.max_hp > 400 ? (character.max_hp - character.hp > 200) : (character.hp < 200))) {
            equip(get_inventory_slot(hpot));
        }
    }
}