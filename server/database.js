const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'folkvang.db'))

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        respawn_type TEXT NOT NULL,
        respawn_min INTEGER NOT NULL,
        respawn_max INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS floors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (section_id) REFERENCES sections(id)
    );

    CREATE TABLE IF NOT EXISTS bosses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        floor_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        position TEXT,
        FOREIGN KEY (floor_id) REFERENCES floors(id)
    );

    CREATE TABLE IF NOT EXISTS boss_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boss_id INTEGER NOT NULL UNIQUE,
        killed_at INTEGER,
        respawn_at INTEGER,
        respawn_min_at INTEGER,
        respawn_max_at INTEGER,
        FOREIGN KEY (boss_id) REFERENCES bosses(id)
    );
`)

function seed() {
    const existing = db.prepare('SELECT COUNT(*) as count FROM sections').get()
    if (existing.count > 0) {
        console.log('Database already seeded, skipping.')
        return
    }

    console.log('Seeding database...')

    const insertSection = db.prepare(`
        INSERT INTO sections (name, respawn_type, respawn_min, respawn_max)
        VALUES (@name, @type, @min, @max)
    `)

    const insertFloor = db.prepare(`
        INSERT INTO floors (section_id, name)
        VALUES (@sectionId, @name)
    `)

    const insertBoss = db.prepare(`
        INSERT INTO bosses (floor_id, name, position)
        VALUES (@floorId, @name, @position)
    `)

    const h = 60 * 60 * 1000  // 1 hour in ms
    const m = 60 * 1000        // 1 minute in ms

    const sections = [
        {
            name: 'Inter Folkvang',
            type: 'fixed',
            min: 2 * h,
            max: 2 * h,
            floors: [1, 2, 3, 4].map(f => ({
                name: `Inter ${f}F`,
                bosses: [
                    { name: 'Berserker', position: 'upper-left' },
                    { name: 'Warlord',   position: 'upper-right' },
                    { name: 'Volva',     position: 'lower-right' },
                    { name: 'Skald',     position: 'lower-left' },
                ]
            }))
        },
        {
            name: 'Normal Folkvang',
            type: 'fixed',
            min: 8 * h,
            max: 8 * h,
            floors: [1, 2, 3, 4].map(f => ({
                name: `Normal ${f}F`,
                bosses: [
                    { name: 'Berserker', position: 'upper-left' },
                    { name: 'Warlord',   position: 'upper-right' },
                    { name: 'Volva',     position: 'lower-right' },
                    { name: 'Skald',     position: 'lower-left' },
                ]
            }))
        },
        {
            name: 'Myrkrheim',
            type: 'range',
            min: 30 * m,
            max: 60 * m,
            floors: [1, 2, 3].map(f => ({
                name: `Myrkrheim ${f}F`,
                bosses: [
                    { name: 'Level 1', position: '1' },
                    { name: 'Level 2', position: '2' },
                    { name: 'Level 3', position: '3' },
                ]
            }))
        },
        {
            name: "Troll's Tomb",
            type: 'range',
            min: 30 * m,
            max: 60 * m,
            floors: [1, 2, 3, 4].map(f => ({
                name: `Troll ${f}F`,
                bosses: [
                    { name: 'Depth 1', position: '1' },
                    { name: 'Depth 2', position: '2' },
                ]
            }))
        },
    ]

    // Wrap everything in a transaction — all or nothing
    const runSeed = db.transaction(() => {
        for (const section of sections) {
            const { lastInsertRowid: sectionId } = insertSection.run({
                name: section.name,
                type: section.type,
                min: section.min,
                max: section.max,
            })

            for (const floor of section.floors) {
                const { lastInsertRowid: floorId } = insertFloor.run({
                    sectionId,
                    name: floor.name,
                })

                for (const boss of floor.bosses) {
                    insertBoss.run({
                        floorId,
                        name: boss.name,
                        position: boss.position ?? null,
                    })
                }
            }
        }
    })

    runSeed()
    console.log('Seeding complete.')
}

seed()

module.exports = db