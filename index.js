import core from '@actions/core'
import { Client } from '@notionhq/client'

const { Client } = require('@notionhq/client')

const notionApiToken = core.getInput('notion-api-token')
const notionDatabaseId = core.getInput('notion-database-id')
const releaseVersion = core.getInput('release-version')
const releaseDate = core.getInput('release-date')

const notion = new Client({ auth: notionApiToken })

try {
	console.log('Creating Notion database page', {
		notionDatabaseId,
		releaseVersion,
		releaseDate,
	})
	const result = await notion.pages.create({
		parent: {
			type: 'database_id',
			database_id: notionDatabaseId,
		},
		properties: {
			Version: {
				type: 'title',
				title: [{ type: 'text', text: { content: releaseVersion } }],
			},
			'Release Date': {
				type: 'date',
				date: { start: releaseDate },
			},
		},
	})
	console.log('Notion database page created', result)
} catch (error) {
	console.error(error)
	core.setFailed(error.message)
}
