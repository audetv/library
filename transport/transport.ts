namespace $ {

	const Results = $mol_data_record( {
		took: $mol_data_integer,
		time_out: $mol_data_boolean,
		hits: $mol_data_record( {
			total: $mol_data_integer,
			total_relation: $mol_data_string,
			hits: $mol_data_array( $mol_data_record( {
				_id: $mol_data_string,
				_score: $mol_data_integer,
				_source: $mol_data_record( {
					genre: $mol_data_string,
					author: $mol_data_string,
					title: $mol_data_string,
					text: $mol_data_string,
					position: $mol_data_integer,
					length: $mol_data_integer,
				})
			}))
		}),
	} ) 

	interface HighlightFields {
		fields: string[]
		limit: number
		no_match_size: number
		pre_tags: string
		post_tags: string
	}

	interface QueryString {
		index: string
		highlight?: HighlightFields
		query: {
			query_string: string
			bool: {
				must: {}[]
			}
		}
		limit: number
		offset: number
		max_matches?: number
		sort?: {}[]
	}

	const aggs = {
		book_genre: {
			terms: {
				field: "genre",
				size: 1000
			}
		},
		book_author: {
			terms: {
				field: "author",
				size: 1000
			}
		},
		book_title: {
			terms: {
				field: "title",
				size: 10000
			}
		}
	}

	const Query = (query: string ) => ({
		index: 'library',
		aggs: aggs,
		highlight: {
			fields: [ "text" ],
			limit: 0,
			no_match_size: 0,
			pre_tags: "<strong>",
			post_tags: "</strong>",
		},
		query: {
			query_string: query,
		},
		limit: 1000,
		offset: 0,
		max_matches: 10000,
	})

	export class $audetv_library_transport extends $mol_object2 {
		static api_base() {
			return 'http://library.localhost/search'
		}

		@$mol_mem
		static token( next?: string | null ) {
			return this.$.$mol_state_local.value( 'token', next )
		}

		@$mol_mem
		static headers() {

			const headers = {
				'Content-Type': 'application/json',
			}

			const token = this.token()
			if( !token ) return headers

			return {
				...headers,
				'Authorization': `Token ${ token }`,
			}

		}

		@$mol_action
		static search( query: string ): any {

			const queryBody = Query( query )
			return this.$.$mol_fetch.json( this.api_base(),
			{
				method: 'POST',
				headers: this.headers(),
				body: JSON.stringify(queryBody),
			} )
		}
	}
}
