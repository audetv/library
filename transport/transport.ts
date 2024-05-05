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

			return this.$.$mol_fetch.json( this.api_base(),
			{
				method: 'POST',
				headers: this.headers(),
				body: `{"index": "library", "query": {"query_string": "${ query }"},"max_matches": 10000,"limit": 10000}`,
			} )
		}
	}
}
