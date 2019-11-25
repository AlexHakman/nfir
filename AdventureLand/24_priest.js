class Priest extends Character
{

    loop ()
    {
        super.loop();

        this.farm();
    }

    farm ()
    {
        if(this.c.rip) respawn();
        check_for_party_members_state();

        const target = get_farm_target(100, 120);

        if (target) {
            let range = MapHelper.distanceToPoint(target.real_x, target.real_y);

            if (range <= character.range * 0.7) {
                this.kite(target);
            }
            else {
                this.moveToTarget(target, character.range * 0.5, character.range * 0.99);
            }
            if (can_attack(target))  attack(target);
        }
        else {
            if(character.party) {
                this.moveToLeader(character.range * 0.5, character.range * 0.7);
            }
        }
    }
}

var last_attack = new Date(0);

//Returns the party member with the lowest hp -> max_hp ratio.
function lowest_health_party_member(cutOff = 0.99) {
    let lowestHealth;
    let lowestEntity;
    if (parent.party_list.length > 0) {
        for (let id in parent.party_list) {
            let entity = parent.entities[parent.party_list[id]];
            if (!entity || entity.rip) continue;
            if (entity.hp < entity.max_hp * cutOff) {
                if (!lowestHealth || entity.hp / entity.max_hp < lowestHealth) {
                    lowestEntity = entity;
                    lowestHealth = entity.hp / entity.max_hp;
                }
            }
        }
    }
    //Return the lowest health
    if (lowestEntity) return lowestEntity;
}

// Return number of wounded below a threshold
function party_hurt_count(amount = 0.75) {
    let count = 0;
    if (parent.party_list.length > 0) {
        for (let id in parent.party_list) {
            let member = parent.party_list[id];
            let entity = parent.entities[member];
            if (entity && entity.hp < entity.max_hp * amount) count += 1;
        }
    }
    return count;
}

function party_dead_count()
{
    if (parent.party_list.length > 0) {
        for (let id in parent.party_list) {
            let member = parent.party_list[id];
            let entity = parent.entities[member];
            if (!entity || member === character.name) continue;
            if (!entity.rip) continue;
            if (entity) return entity;
        }
    }
}

function check_for_party_members_state()
{
    if (party_hurt_count() > 1) party_heal();
    if (member = lowest_health_party_member()) heal(member);
    if (num_items('essenceoflife') > 0 && (dead_member = party_dead_count())) revive(dead_member);
}

function revive(member)
{
    game_log('reviving party');
    if (mssince(last_attack) < 400 && !can_use('revive', member)) return;
    use('revive', member);
    last_attack=new Date();
}

function party_heal()
{
    game_log('Healing party');
    if (mssince(last_attack) < 400 && !can_use('partyheal')) return;
    use('partyheal');
    last_attack=new Date();
}

function heal(target)
{
    if(mssince(last_attack) < 400) return;

    if(!in_attack_range(target)){
        this.moveToTarget(target, character.range * 0.5, character.range * 0.99);
    } else {
        parent.player_heal.call(target);
        last_attack=new Date();
    }
}